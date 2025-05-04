"use client"

import { useState, useEffect, useRef } from "react"

interface UseSpeechRecognitionOptions {
  lang?: string
  continuous?: boolean
  interimResults?: boolean
  maxAlternatives?: number
  onResult?: (transcript: string) => void
  onError?: (error: string) => void
}

interface UseSpeechRecognitionReturn {
  isListening: boolean
  transcript: string
  startListening: () => void
  stopListening: () => void
  toggleListening: () => void
  isSupported: boolean
  error: string | null
}

// declare SpeechRecognition variable
declare var SpeechRecognition: any
declare var webkitSpeechRecognition: any

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)

  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Настройки по умолчанию
  const { lang = "ru-RU", continuous = false, interimResults = false, maxAlternatives = 1, onResult, onError } = options

  useEffect(() => {
    // Проверяем поддержку браузером
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (SpeechRecognitionAPI) {
      setIsSupported(true)
      const recognition = new SpeechRecognitionAPI() as SpeechRecognition

      // Настройка параметров
      recognition.lang = lang
      recognition.continuous = continuous
      recognition.interimResults = interimResults
      recognition.maxAlternatives = maxAlternatives

      // Обработчик результатов
      recognition.onresult = (event) => {
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
      }

      // Обработчик ошибок
      recognition.onerror = (event) => {
        const errorMessage = `Ошибка распознавания: ${event.error}`
        console.error(errorMessage, event.message)
        setError(errorMessage)
        setIsListening(false)

        if (onError) {
          onError(errorMessage)
        }
      }

      recognitionRef.current = recognition
    } else {
      setIsSupported(false)
      setError("Ваш браузер не поддерживает распознавание речи")
      console.warn("Ваш браузер не поддерживает распознавание речи")
    }

    // Очистка при размонтировании
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch (e) {
          console.error("Ошибка при остановке распознавания:", e)
        }
      }
    }
  }, [lang, continuous, interimResults, maxAlternatives, onResult, onError])

  const startListening = () => {
    if (!recognitionRef.current) {
      setError("Распознавание речи не поддерживается")
      return
    }

    setError(null)

    try {
      recognitionRef.current.start()
      setIsListening(true)
      console.log("Начало распознавания речи...")
    } catch (error) {
      console.error("Ошибка при запуске распознавания:", error)
      setError("Не удалось запустить распознавание речи")
      setIsListening(false)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    toggleListening,
    isSupported,
    error,
  }
}
