"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, X, Check, Volume2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface VoiceInputOverlayProps {
  isOpen: boolean
  onClose: () => void
  onTextRecognized?: (text: string) => void
}

export function VoiceInputOverlay({ isOpen, onClose, onTextRecognized }: VoiceInputOverlayProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [showText, setShowText] = useState(false)
  const [permissionError, setPermissionError] = useState(false)
  const [microphoneLevel, setMicrophoneLevel] = useState<number[]>(Array(20).fill(2))

  // Для отслеживания, была ли уже проверка микрофона
  const micCheckedRef = useRef(false)
  const recognitionRef = useRef<any>(null)

  // Проверка доступа к микрофону только при первом открытии
  useEffect(() => {
    if (isOpen && !micCheckedRef.current) {
      micCheckedRef.current = true

      // Проверяем доступ к микрофону
      const checkMicAccess = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          // Если успешно получили доступ, останавливаем все треки
          stream.getTracks().forEach((track) => track.stop())
          setPermissionError(false)
        } catch (err) {
          console.log("Нет доступа к микрофону:", err)
          setPermissionError(true)
        }
      }

      checkMicAccess()
    }

    // При закрытии сбрасываем состояния
    if (!isOpen) {
      setIsListening(false)
      setShowText(false)
      setTranscript("")

      // Останавливаем распознавание, если оно активно
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          // Игнорируем ошибки при остановке
        }
        recognitionRef.current = null
      }
    }
  }, [isOpen])

  // Эффект визуализации записи микрофона
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isListening) {
      interval = setInterval(() => {
        setMicrophoneLevel(
          Array(20)
            .fill(0)
            .map(() => Math.floor(Math.random() * 30) + 5),
        )
      }, 100)
    } else {
      setMicrophoneLevel(Array(20).fill(2))
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isListening])

  // Имитация записи голоса с реальным распознаванием
  const handleStartRecording = () => {
    if (isListening) return

    try {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition

      if (!SpeechRecognition) {
        console.log("Браузер не поддерживает распознавание речи")
        setPermissionError(true)
        return
      }

      const recognition = new SpeechRecognition()
      recognition.lang = "ru-RU"
      recognition.interimResults = false

      recognition.onresult = (event: any) => {
        const result = event.results[event.resultIndex]
        if (result.isFinal) {
          const recognizedText = result[0].transcript
          setTranscript(recognizedText)
          setShowText(true)
          setIsListening(false)

          if (onTextRecognized) {
            onTextRecognized(recognizedText)
          }
        }
      }

      recognition.onerror = (event: any) => {
        console.log("Ошибка распознавания:", event.error)
        if (event.error === "not-allowed") {
          setPermissionError(true)
        }
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)

        // Если не было распознанного текста, показываем экран с пустым результатом
        if (!transcript && !showText) {
          setShowText(true)
        }
      }

      recognition.start()
      recognitionRef.current = recognition
      setIsListening(true)
      setShowText(false)
    } catch (error) {
      console.error("Ошибка при запуске распознавания:", error)
      setPermissionError(true)
    }
  }

  const handleStopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        console.log("Ошибка при остановке распознавания:", e)
      }
    }
    setIsListening(false)
  }

  const handleCancel = () => {
    if (isListening) {
      handleStopRecording()
    }
    setShowText(false)
    setTranscript("")
    onClose()
  }

  const handleDone = () => {
    setShowText(false)
    setTranscript("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        {/* Overlay background */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={handleCancel} />

        {/* Dialog content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative bg-white/10 dark:bg-black/20 backdrop-blur-xl rounded-3xl w-[90%] max-w-md p-8 flex flex-col items-center shadow-2xl border border-white/20 dark:border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="w-full flex justify-between items-center mb-8">
            <div className="text-lg font-medium text-white">
              {permissionError ? "Требуется разрешение" : showText ? "Распознанный текст" : "Голосовой ввод"}
            </div>
            <Button variant="ghost" size="icon" onClick={handleCancel} className="text-white/70 hover:text-white">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Main content */}
          {permissionError ? (
            // Permission error state
            <div className="flex flex-col items-center justify-center w-full py-8">
              <div className="bg-red-500/20 p-4 rounded-full mb-6">
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Нет доступа к микрофону</h3>
              <p className="text-white/70 text-center mb-6">
                Пожалуйста, разрешите доступ к микрофону в настройках браузера.
              </p>
              <Button onClick={handleCancel} className="bg-primary hover:bg-primary/90">
                Закрыть
              </Button>
            </div>
          ) : showText ? (
            // Text display state
            <>
              <div className="w-full mb-8">
                <div className="relative p-6 bg-white/10 dark:bg-white/5 rounded-xl border border-white/10 shadow-inner">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl opacity-30 -translate-y-16 translate-x-16 z-0" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl opacity-30 translate-y-16 -translate-x-16 z-0" />

                  {transcript ? (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <Volume2 className="h-5 w-5 text-primary" />
                        <p className="text-sm font-medium text-primary">Распознано</p>
                      </div>
                      <p className="text-lg font-medium text-white relative z-10">{transcript}</p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                        <p className="text-sm font-medium text-amber-500">Внимание</p>
                      </div>
                      <p className="text-lg font-medium text-white relative z-10">
                        Ничего не распознано. Пожалуйста, говорите громче или проверьте работу микрофона.
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-4 w-full">
                <Button
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                  onClick={handleCancel}
                >
                  Отменить
                </Button>
                <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleDone}>
                  <Check className="mr-2 h-4 w-4" />
                  Готово
                </Button>
              </div>
            </>
          ) : (
            // Recording state
            <>
              {/* Microphone button with pulsing effect */}
              <div className="relative mb-8">
                <motion.div
                  animate={{
                    scale: isListening ? [1, 1.2, 1] : 1,
                    opacity: isListening ? [0.7, 0.5, 0.7] : 0.7,
                  }}
                  transition={{
                    duration: 2,
                    repeat: isListening ? Number.POSITIVE_INFINITY : 0,
                    repeatType: "loop",
                  }}
                  className="absolute inset-0 rounded-full bg-primary/30"
                />

                <motion.div
                  animate={{
                    scale: isListening ? [1, 1.1, 1] : 1,
                    opacity: isListening ? [0.9, 0.7, 0.9] : 0.9,
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: isListening ? Number.POSITIVE_INFINITY : 0,
                    repeatType: "loop",
                    delay: 0.2,
                  }}
                  className="absolute inset-0 rounded-full bg-primary/50"
                />

                <Button
                  size="lg"
                  className={cn(
                    "h-24 w-24 rounded-full relative bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/50",
                    isListening && "ring-4 ring-primary/30",
                  )}
                  onClick={isListening ? handleStopRecording : handleStartRecording}
                >
                  <Mic className="h-10 w-10" />
                </Button>
              </div>

              {/* Audio visualizer */}
              <div className="flex items-end justify-center gap-1 h-16 mb-6">
                {microphoneLevel.map((value, index) => (
                  <motion.div
                    key={index}
                    animate={{ height: `${value}px` }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="w-1 bg-primary/80 rounded-full"
                  />
                ))}
              </div>

              {/* Status text */}
              <div className="text-center text-white/80">
                {isListening ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="animate-pulse">Говорите...</span>
                    <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                  </div>
                ) : (
                  <div>Нажмите на микрофон, чтобы начать запись</div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
