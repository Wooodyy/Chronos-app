"use client"

import { useState, useEffect, useRef } from "react"

interface UseSpeechRecognitionOptions {
  lang?: string
  onResult?: (transcript: string) => void
  onError?: (error: string) => void
  onSilence?: () => void
}

interface UseSpeechRecognitionReturn {
  isListening: boolean
  transcript: string
  startListening: () => Promise<void>
  stopListening: () => void
  isSupported: boolean
  error: string | null
  resetTranscript: () => void
  hasPermission: boolean
  checkPermission: () => Promise<boolean>
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)

  const recognitionRef = useRef<any>(null)
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)

  // Настройки
  const { lang = "ru-RU", onResult, onError, onSilence } = options

  // Проверяем поддержку API распознавания речи
  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setIsSupported(!!SpeechRecognitionAPI)

    if (!SpeechRecognitionAPI) {
      console.warn("Браузер не поддерживает распознавание речи")
    }

    // Проверяем разрешение при монтировании
    checkPermission().catch(console.error)

    // Очистка при размонтировании
    return () => {
      cleanup()
    }
  }, [])

  // Функция очистки ресурсов
  const cleanup = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch (e) {
        console.log("Ошибка при остановке распознавания:", e)
      }
      recognitionRef.current = null
    }

    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current)
      silenceTimeoutRef.current = null
    }

    if (micStreamRef.current) {
      try {
        const tracks = micStreamRef.current.getTracks()
        tracks.forEach((track) => track.stop())
      } catch (e) {
        console.log("Ошибка при остановке микрофона:", e)
      }
      micStreamRef.current = null
    }

    if (audioContextRef.current) {
      try {
        if (audioContextRef.current.state !== "closed") {
          audioContextRef.current.close()
        }
      } catch (e) {
        console.log("Ошибка при закрытии AudioContext:", e)
      }
      audioContextRef.current = null
    }
  }

  // Проверка разрешения на доступ к микрофону
  const checkPermission = async (): Promise<boolean> => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

        // Сохраняем поток для дальнейшего использования или останавливаем его
        if (micStreamRef.current) {
          micStreamRef.current.getTracks().forEach((track) => track.stop())
        }

        // Останавливаем поток, так как мы только проверяем разрешение
        stream.getTracks().forEach((track) => track.stop())

        setHasPermission(true)
        return true
      } else {
        setHasPermission(false)
        return false
      }
    } catch (err) {
      console.error("Ошибка при проверке доступа к микрофону:", err)
      setHasPermission(false)
      return false
    }
  }

  // Функция для запуска распознавания
  const startListening = async (): Promise<void> => {
    if (!isSupported) {
      const errorMsg = "Распознавание речи не поддерживается в вашем браузере"
      setError(errorMsg)
      if (onError) onError(errorMsg)
      return
    }

    if (isListening) {
      return // Уже слушаем
    }

    // Проверяем разрешение
    const hasAccess = await checkPermission()
    if (!hasAccess) {
      const errorMsg = "Нет доступа к микрофону"
      setError(errorMsg)
      if (onError) onError(errorMsg)
      return
    }

    // Сбрасываем предыдущие состояния
    setError(null)
    setTranscript("")

    // Очищаем предыдущие ресурсы
    cleanup()

    try {
      // Создаем новый экземпляр распознавания
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognitionAPI()

      // Настройка параметров
      recognition.lang = lang
      recognition.continuous = false // Останавливаем после признания фразы
      recognition.interimResults = false // Получаем только финальные результаты
      recognition.maxAlternatives = 1

      // Обработчик результатов
      recognition.onresult = (event: any) => {
        const result = event.results[event.resultIndex]
        if (result.isFinal) {
          const recognizedText = result[0].transcript
          console.log("Распознанный текст:", recognizedText)
          setTranscript(recognizedText)

          if (onResult) {
            onResult(recognizedText)
          }
        }
      }

      // Обработчик окончания распознавания
      recognition.onend = () => {
        setIsListening(false)
        console.log("Распознавание завершено")

        // Если не было текста, вызываем обработчик тишины
        if (!transcript && onSilence) {
          onSilence()
        }
      }

      // Обработчик ошибок
      recognition.onerror = (event: any) => {
        if (event.error !== "aborted") {
          const errorMsg = `Ошибка распознавания: ${event.error}`
          console.error(errorMsg)
          setError(errorMsg)

          if (onError) {
            onError(errorMsg)
          }
        }
        setIsListening(false)
      }

      recognitionRef.current = recognition

      // Запускаем автоматическую остановку через определенное время для обнаружения тишины
      silenceTimeoutRef.current = setTimeout(() => {
        if (isListening && recognitionRef.current) {
          console.log("Тайм-аут распознавания, останавливаем")
          stopListening()

          if (onSilence) {
            onSilence()
          }
        }
      }, 10000) // 10 секунд максимальное время записи

      // Запускаем распознавание
      recognition.start()
      setIsListening(true)
      console.log("Начало распознавания речи")
    } catch (err) {
      console.error("Ошибка при запуске распознавания:", err)
      const errorMsg = "Не удалось запустить распознавание речи"
      setError(errorMsg)
      if (onError) onError(errorMsg)
      setIsListening(false)
    }
  }

  // Функция для остановки распознавания
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (err) {
        console.error("Ошибка при остановке распознавания:", err)
        try {
          recognitionRef.current.abort()
        } catch (abortErr) {
          console.error("Ошибка при прерывании распознавания:", abortErr)
        }
      }
    }

    // Очищаем таймер тишины
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current)
      silenceTimeoutRef.current = null
    }

    setIsListening(false)
  }

  // Сброс текста
  const resetTranscript = () => {
    setTranscript("")
  }

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported,
    error,
    resetTranscript,
    hasPermission,
    checkPermission,
  }
}
