"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, X, Loader2, Check, Volume2, AlertCircle, AlertTriangle } from "lucide-react"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface VoiceInputOverlayProps {
  isOpen: boolean
  onClose: () => void
  onTextRecognized?: (text: string) => void
}

export function VoiceInputOverlay({ isOpen, onClose, onTextRecognized }: VoiceInputOverlayProps) {
  const [showText, setShowText] = useState(false)
  const [processingDone, setProcessingDone] = useState(false)
  const [visualizerValues, setVisualizerValues] = useState<number[]>(Array(20).fill(2))
  const [permissionError, setPermissionError] = useState(false)

  const { isListening, transcript, startListening, stopListening, isSupported, error, resetTranscript, isSilent } =
    useSpeechRecognition({
      lang: "ru-RU",
      interimResults: true,
      silenceTimeout: 2000,
      onResult: (text) => {
        if (onTextRecognized) {
          onTextRecognized(text)
        }
      },
      onError: (errorMsg) => {
        if (errorMsg.includes("permission") || errorMsg.includes("denied")) {
          setPermissionError(true)
        }
      },
      onSilence: () => {
        console.log("Тишина обнаружена в компоненте")
        setShowText(true)
        setProcessingDone(true)
      },
    })

  // Reset states when overlay opens/closes
  useEffect(() => {
    if (!isOpen) {
      setShowText(false)
      setProcessingDone(false)
      setPermissionError(false)
      resetTranscript()
      if (isListening) {
        stopListening()
      }
    }
  }, [isOpen, isListening, stopListening, resetTranscript])

  // Show text after recording stops
  useEffect(() => {
    if (!isListening && (transcript || isSilent)) {
      setShowText(true)

      // Simulate processing time only if we have actual transcript
      if (transcript) {
        setTimeout(() => {
          setProcessingDone(true)
        }, 1500)
      } else {
        // If silent, immediately show the "nothing recognized" message
        setProcessingDone(true)
      }
    }
  }, [transcript, isListening, isSilent])

  // Audio visualizer animation
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isListening) {
      interval = setInterval(() => {
        setVisualizerValues(
          Array(20)
            .fill(0)
            .map(() => (isListening ? Math.floor(Math.random() * 30) + 5 : 2)),
        )
      }, 100)
    } else {
      // Сбрасываем визуализатор, когда запись не идет
      setVisualizerValues(Array(20).fill(2))
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isListening])

  // Handle cancel
  const handleCancel = () => {
    if (isListening) {
      stopListening()
    }
    setShowText(false)
    setProcessingDone(false)
    setPermissionError(false)
    resetTranscript()
    onClose()
  }

  // Handle done
  const handleDone = () => {
    setShowText(false)
    setProcessingDone(false)
    resetTranscript()
    onClose()
  }

  // Handle toggle recording
  const handleToggleRecording = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  // Фильтруем ошибки, которые не должны отображаться пользователю
  const shouldShowError =
    error && error !== "Ошибка распознавания: aborted" && !error.includes("Не удалось получить доступ к микрофону")

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        {/* Blurred background */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={handleCancel} />

        {/* Content container */}
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
              {permissionError ? "Требуется разрешение" : !showText ? "Голосовой ввод" : "Распознанный текст"}
            </div>
            <Button variant="ghost" size="icon" onClick={handleCancel} className="text-white/70 hover:text-white">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {permissionError ? (
            // Permission error state
            <div className="flex flex-col items-center justify-center w-full py-8">
              <div className="bg-red-500/20 p-4 rounded-full mb-6">
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Нет доступа к микрофону</h3>
              <p className="text-white/70 text-center mb-6">
                Пожалуйста, разрешите доступ к микрофону в настройках браузера и попробуйте снова.
              </p>
              <Button onClick={handleCancel} className="bg-primary hover:bg-primary/90">
                Закрыть
              </Button>
            </div>
          ) : !showText ? (
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
                  onClick={handleToggleRecording}
                >
                  <Mic className="h-10 w-10" />
                </Button>
              </div>

              {/* Audio visualizer */}
              <div className="flex items-end justify-center gap-1 h-16 mb-6">
                {visualizerValues.map((value, index) => (
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
                  <div className="flex items-center gap-2">
                    <span className="animate-pulse">Говорите...</span>
                    <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                  </div>
                ) : (
                  <div>Нажмите на микрофон, чтобы начать запись</div>
                )}
              </div>

              {/* Error message 
              {shouldShowError && <div className="mt-4 text-red-400 text-sm text-center">{error}</div>}*/}
            </>
          ) : (
            // Text display state
            <>
              {/* Recognized text display */}
              <div className="w-full mb-8">
                <div className="relative p-6 bg-white/10 dark:bg-white/5 rounded-xl border border-white/10 shadow-inner">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl opacity-30 -translate-y-16 translate-x-16 z-0" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl opacity-30 translate-y-16 -translate-x-16 z-0" />

                  {/* Text */}
                  {!processingDone ? (
                    <div className="flex flex-col items-center justify-center py-4">
                      <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                      <p className="text-white/80">Обработка текста...</p>
                    </div>
                  ) : transcript ? (
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
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
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
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
