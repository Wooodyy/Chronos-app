"use client"

import { useState, useEffect, useRef } from "react"

interface UseSpeechRecognitionOptions {
  lang?: string
  continuous?: boolean
  interimResults?: boolean
  maxAlternatives?: number
  silenceTimeout?: number
  onResult?: (transcript: string) => void
  onError?: (error: string) => void
  onSilence?: () => void
}

interface UseSpeechRecognitionReturn {
  isListening: boolean
  transcript: string
  startListening: () => void
  stopListening: () => void
  toggleListening: () => void
  isSupported: boolean
  error: string | null
  resetTranscript: () => void
  isSilent: boolean
}

// declare SpeechRecognition variable
declare var SpeechRecognition: any
declare var webkitSpeechRecognition: any

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [isSilent, setIsSilent] = useState(false)

  const recognitionRef = useRef<any>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const microphoneStreamRef = useRef<MediaStream | null>(null)
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const initialSilenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const hasSpeechRef = useRef(false)
  const audioAnalysisActiveRef = useRef(false)

  // Настройки по умолчанию
  const {
    lang = "ru-RU",
    continuous = false,
    interimResults = true,
    maxAlternatives = 1,
    silenceTimeout = 2000,
    onResult,
    onError,
    onSilence,
  } = options

  // Проверка поддержки браузером
  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setIsSupported(!!SpeechRecognitionAPI)

    if (!SpeechRecognitionAPI) {
      setError("Ваш браузер не поддерживает распознавание речи")
      console.warn("Ваш браузер не поддерживает распознавание речи")
    }

    return () => {
      cleanupAudio()
    }
  }, [])

  // Функция для очистки аудио ресурсов
  const cleanupAudio = () => {
    audioAnalysisActiveRef.current = false

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }

    if (initialSilenceTimerRef.current) {
      clearTimeout(initialSilenceTimerRef.current)
      initialSilenceTimerRef.current = null
    }

    if (microphoneStreamRef.current) {
      const tracks = microphoneStreamRef.current.getTracks()
      tracks.forEach((track) => track.stop())
      microphoneStreamRef.current = null
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        audioContextRef.current.close().catch((e) => {
          console.log("Ошибка при закрытии AudioContext:", e)
        })
      } catch (e) {
        console.log("Ошибка при закрытии AudioContext:", e)
      }
    }

    audioContextRef.current = null
    analyserRef.current = null
  }

  // Функция для анализа уровня звука
  const setupAudioAnalysis = async () => {
    try {
      // Очищаем предыдущие ресурсы
      cleanupAudio()

      // Устанавливаем флаг активности анализа звука
      audioAnalysisActiveRef.current = true

      // Создаем новый AudioContext
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContextClass) {
        console.warn("AudioContext не поддерживается браузером")
        return
      }

      audioContextRef.current = new AudioContextClass()

      // Запрашиваем доступ к микрофону
      try {
        microphoneStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true })
      } catch (err) {
        console.error("Ошибка доступа к микрофону:", err)
        // Не устанавливаем ошибку, так как распознавание речи может работать без анализа звука
        return
      }

      // Если анализ звука был отменен во время запроса доступа к микрофону
      if (!audioAnalysisActiveRef.current) {
        cleanupAudio()
        return
      }

      // Создаем анализатор
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256

      // Подключаем микрофон к анализатору
      const source = audioContextRef.current.createMediaStreamSource(microphoneStreamRef.current)
      source.connect(analyserRef.current)

      // Устанавливаем флаг тишины
      setIsSilent(false)
      hasSpeechRef.current = false

      // Запускаем таймер для проверки начальной тишины
      initialSilenceTimerRef.current = setTimeout(() => {
        if (!hasSpeechRef.current && isListening) {
          console.log("Начальная тишина обнаружена, останавливаем запись")
          stopListening()
          setIsSilent(true)
          if (onSilence) onSilence()
        }
      }, silenceTimeout)

      // Запускаем анализ звука
      detectSound()
    } catch (err) {
      console.error("Ошибка при настройке анализа звука:", err)
      // Не устанавливаем ошибку, так как распознавание речи может работать без анализа звука
    }
  }

  // Функция для обнаружения звука
  const detectSound = () => {
    if (!analyserRef.current || !isListening || !audioAnalysisActiveRef.current) return

    try {
      const bufferLength = analyserRef.current.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      analyserRef.current.getByteFrequencyData(dataArray)

      // Вычисляем среднюю громкость
      let sum = 0
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i]
      }
      const average = sum / bufferLength

      // Порог для определения речи (может потребоваться настройка)
      const threshold = 15

      if (average > threshold) {
        // Звук обнаружен
        hasSpeechRef.current = true

        // Сбрасываем таймер тишины
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current)
        }

        // Устанавливаем новый таймер тишины
        silenceTimerRef.current = setTimeout(() => {
          if (isListening && audioAnalysisActiveRef.current) {
            console.log("Тишина обнаружена, останавливаем запись")
            stopListening()
          }
        }, silenceTimeout)
      }

      // Продолжаем анализ, если все еще слушаем
      if (isListening && audioAnalysisActiveRef.current) {
        requestAnimationFrame(detectSound)
      }
    } catch (e) {
      console.error("Ошибка при анализе звука:", e)
      // Прекращаем анализ при ошибке, но не останавливаем распознавание
      audioAnalysisActiveRef.current = false
    }
  }

  const startListening = () => {
    if (!isSupported) {
      setError("Распознавание речи не поддерживается")
      return
    }

    if (isListening) {
      return // Уже слушаем
    }

    setError(null)
    setTranscript("")
    setIsSilent(false)
    hasSpeechRef.current = false

    try {
      // Настраиваем анализ звука (не блокируем основной поток распознавания)
      setupAudioAnalysis().catch((e) => {
        console.error("Ошибка при настройке анализа звука:", e)
        // Не устанавливаем ошибку, так как распознавание речи может работать без анализа звука
      })

      // Создаем новый экземпляр для каждого сеанса распознавания
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

      // Останавливаем предыдущий экземпляр, если он существует
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch (e) {
          console.log("Ошибка при остановке предыдущего распознавания:", e)
        }
      }

      const recognition = new SpeechRecognitionAPI()

      // Настройка параметров
      recognition.lang = lang
      recognition.continuous = continuous
      recognition.interimResults = interimResults
      recognition.maxAlternatives = maxAlternatives

      // Обработчик результатов
      recognition.onresult = (event: any) => {
        const result = event.results[event.resultIndex]
        if (result.isFinal) {
          const recognizedText = result[0].transcript
          setTranscript(recognizedText)
          console.log("Распознанный текст:", recognizedText)

          if (onResult) {
            onResult(recognizedText)
          }
        }
      }

      // Обработчик окончания распознавания
      recognition.onend = () => {
        setIsListening(false)
        console.log("Распознавание завершено")

        // Если не было речи, устанавливаем флаг тишины
        if (!transcript && !hasSpeechRef.current) {
          setIsSilent(true)
          if (onSilence) onSilence()
        }

        // Очищаем ресурсы
        cleanupAudio()
      }

      // Обработчик ошибок
      recognition.onerror = (event: any) => {
        // Игнорируем ошибку aborted, так как она возникает при нормальном завершении
        if (event.error !== "aborted") {
          const errorMessage = `Ошибка распознавания: ${event.error}`
          //console.error(errorMessage, event.message)
          setError(errorMessage)

          if (onError) {
            onError(errorMessage)
          }
        }

        setIsListening(false)
        cleanupAudio()
      }

      recognitionRef.current = recognition

      // Запускаем распознавание
      recognition.start()
      setIsListening(true)
      console.log("Начало распознавания речи...")
    } catch (error) {
      console.error("Ошибка при запуске распознавания:", error)
      setError("Не удалось запустить распознавание речи. Пожалуйста, проверьте разрешения микрофона.")
      setIsListening(false)
      cleanupAudio()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop()
      } catch (error) {
        console.error("Ошибка при остановке распознавания:", error)
        // Если не удалось остановить, пробуем прервать
        try {
          recognitionRef.current.abort()
        } catch (abortError) {
          console.error("Ошибка при прерывании распознавания:", abortError)
        }
      }
      setIsListening(false)
      cleanupAudio()
    }
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const resetTranscript = () => {
    setTranscript("")
  }

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.abort()
        } catch (e) {
          console.error("Ошибка при остановке распознавания:", e)
        }
      }
      cleanupAudio()
    }
  }, [isListening])

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    toggleListening,
    isSupported,
    error,
    resetTranscript,
    isSilent,
  }
}
