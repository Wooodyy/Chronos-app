"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mic,
  X,
  AlertTriangle,
  Loader,
  RefreshCcw,
  ListTodo,
  Bell,
  FileText,
  Calendar,
  Clock,
  Flag,
  Tag,
  Repeat,
  Save,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { generateStructuredEntry } from "@/lib/gemini-service"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import { format as formatDateFns } from "date-fns"
import type { Locale } from "date-fns"
// Import locales for date-fns if you want to localize date formats beyond just text
// import { enUS, kk } from "date-fns/locale"; // kk for Kazakh
import { ru } from "date-fns/locale" // Russian locale for date-fns
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/contexts/language-context" // Import useLanguage

// Design Constants (remain the same)
const NEW_MODAL_BG = "bg-white/10 dark:bg-black/20"
const NEW_MODAL_BACKDROP_BLUR = "backdrop-blur-xl"
const NEW_MODAL_ROUNDING = "rounded-3xl"
const NEW_MODAL_BORDER = "border-white/20 dark:border-white/10"
const NEW_BACKDROP_BG = "bg-black/40"
const NEW_BACKDROP_BLUR = "backdrop-blur-md"

const ACCENT_COLOR_BG = "bg-purple-600"
const ACCENT_COLOR_TEXT = "text-purple-300"
const ACCENT_COLOR_SHADOW = "shadow-purple-500/50"
const ACCENT_COLOR_RING = "ring-purple-500/30"
const ACCENT_COLOR_BG_HOVER = "hover:bg-purple-700"

const PRIMARY_TEXT_COLOR = "text-white"
const SECONDARY_TEXT_COLOR = "text-white/70"

const INNER_CARD_BG = "bg-white/5"
const INNER_CARD_BORDER = "border-white/10"
const INNER_CARD_ROUNDING = "rounded-xl"
const DECORATIVE_BLOB_BG = "bg-purple-600/5"

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList
  }
  interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult
    length: number
    item(index: number): SpeechRecognitionResult
  }
  interface SpeechRecognitionResult {
    [index: number]: SpeechRecognitionAlternative
    length: number
    isFinal: boolean
    item(index: number): SpeechRecognitionAlternative
  }
  interface SpeechRecognitionAlternative {
    transcript: string
    confidence: number
  }
  interface SpeechRecognitionErrorEvent extends Event {
    error: string
    message?: string
  }
}

type VoiceInputStep =
  | "initializing"
  | "readyToListen"
  | "listening"
  | "processingSpeech"
  | "sendingToAI"
  | "showingAIResponse"
  | "noSpeechDetected"
  | "permissionError"
  | "aiError"

interface VoiceInputOverlayProps {
  isOpen: boolean
  onClose: () => void
}

interface AiResponse {
  type: string
  data: any
  original_transcript: string
  formatted_explanation?: string
}

const BarVisualizer = ({ microphoneLevel }: { microphoneLevel: number[] }) => {
  return (
    <div className="flex items-end justify-center gap-1 h-16 mb-6">
      {microphoneLevel.map((value, index) => (
        <motion.div
          key={index}
          animate={{ height: `${value}px` }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className={cn("w-1 rounded-full", ACCENT_COLOR_BG, "opacity-80")}
        />
      ))}
    </div>
  )
}

const previewTypeIcons: Record<string, React.ElementType> = {
  task: ListTodo,
  reminder: Bell,
  note: FileText,
  unknown: AlertTriangle,
}
// Priority and Repeat labels will be fetched using t() function now
const priorityBadgeColors: Record<string, string> = {
  low: "bg-emerald-600/30 text-emerald-200 border-emerald-500/40",
  medium: "bg-amber-600/30 text-amber-200 border-amber-500/40",
  high: "bg-rose-600/30 text-rose-200 border-rose-500/40",
}
const repeatTypeIcons: Record<string, React.ElementType> = {
  none: Clock,
  daily: Repeat,
  weekly: RefreshCcw,
  monthly: Calendar,
}
const repeatTypeBadgeColor = "bg-sky-600/30 text-sky-200 border-sky-500/40"

interface AiResponsePreviewCardProps {
  response: AiResponse
}

const AiResponsePreviewCard: React.FC<AiResponsePreviewCardProps> = ({ response }) => {
  const { t, language } = useLanguage() // Use language hook for translations
  const { type, data, original_transcript } = response
  const IconComponent = previewTypeIcons[type] || AlertTriangle
  const RepeatIcon = type === "reminder" && data.repeat_type ? repeatTypeIcons[data.repeat_type] || Clock : Clock

  // date-fns locale mapping
  const dateFnsLocales: Record<string, Locale> = {
    ru: ru,
    // en: enUS, // Example for English
    // kz: kk, // Example for Kazakh
  }
  const currentDnsLocale = dateFnsLocales[language] || ru // Default to Russian if locale not mapped

  const DecorativeBlob = ({ className }: { className?: string }) => (
    <div className={cn("absolute w-28 h-28 rounded-full blur-2xl -z-10", DECORATIVE_BLOB_BG, className)} />
  )

  const cardBaseStyle = cn(
    "relative w-full text-left shadow-xl overflow-hidden",
    INNER_CARD_BG,
    INNER_CARD_BORDER,
    INNER_CARD_ROUNDING,
    "p-5",
  )

  if (type === "unknown" || !data) {
    return (
      <div className={cardBaseStyle}>
        <DecorativeBlob className="top-0 right-0 -translate-y-1/3 translate-x-1/3" />
        <DecorativeBlob className="bottom-0 left-0 translate-y-1/3 -translate-x-1/3" />
        <div className="flex items-center gap-2.5 mb-3">
          <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0" />
          <p className="text-sm font-semibold text-amber-400">{t("voiceInput.card.unknownTypeTitle")}</p>
        </div>
        <p className={cn("text-md font-medium relative z-10", PRIMARY_TEXT_COLOR)}>
          {t("voiceInput.card.unknownTypeDesc")}
        </p>
        {original_transcript && (
          <div className={cn("mt-4 pt-3 border-t text-xs", INNER_CARD_BORDER, SECONDARY_TEXT_COLOR)}>
            <p className={cn("font-semibold mb-1", ACCENT_COLOR_TEXT)}>{t("voiceInput.status.recognizedLabel")}</p>
            <p className="italic opacity-90" style={{ wordBreak: "break-word" }}>
              {original_transcript}
            </p>
          </div>
        )}
      </div>
    )
  }

  const typeName =
    type === "task"
      ? t("voiceInput.card.task")
      : type === "reminder"
        ? t("voiceInput.card.reminder")
        : t("voiceInput.card.note")

  const priorityLabels: Record<string, string> = {
    low: t("task.priorityLow"),
    medium: t("task.priorityMedium"),
    high: t("task.priorityHigh"),
  }
  const repeatTypeLabels: Record<string, string> = {
    none: t("reminder.repeatNone"),
    daily: t("reminder.repeatDaily"),
    weekly: t("reminder.repeatWeekly"),
    monthly: t("reminder.repeatMonthly"),
  }

  return (
    <div className={cardBaseStyle}>
      <DecorativeBlob className="top-0 right-0 -translate-y-1/3 translate-x-1/3" />
      <DecorativeBlob className="bottom-0 left-0 translate-y-1/3 -translate-x-1/3" />

      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded-md", ACCENT_COLOR_BG, "bg-opacity-20")}>
              <IconComponent className={cn("h-4 w-4", ACCENT_COLOR_TEXT)} />
            </div>
            <p className={cn("text-sm font-semibold", ACCENT_COLOR_TEXT)}>{typeName}</p>
          </div>
          {data.time && type !== "note" && (
            <div className={cn("text-xs font-medium pt-0.5", SECONDARY_TEXT_COLOR)}>{data.time}</div>
          )}
        </div>

        <h3 className={cn("text-lg font-semibold leading-tight", PRIMARY_TEXT_COLOR)}>
          {data.title || t("voiceInput.card.untitled")}
        </h3>

        <div className="border-t border-white/10 my-1"></div>

        {type === "note" && data.content ? (
          <div
            className={cn(
              "prose prose-sm max-w-none entry-content-html max-h-40 overflow-y-auto custom-scrollbar-sm text-left",
              PRIMARY_TEXT_COLOR,
              "[&_p]:text-white/90 [&_strong]:text-white [&_em]:text-white/90 [&_ul]:text-white/90 [&_ol]:text-white/90 [&_li::marker]:text-purple-300/70",
              "[&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1",
            )}
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
        ) : data.description ? (
          <div className={cn("text-sm max-h-28 overflow-y-auto custom-scrollbar-sm", PRIMARY_TEXT_COLOR, "opacity-90")}>
            <ReactMarkdown
              components={{
                p: ({ node, ...props }) => <p className="my-1" {...props} />,
              }}
            >
              {data.description}
            </ReactMarkdown>
          </div>
        ) : (
          <p className={cn("text-sm italic", SECONDARY_TEXT_COLOR)}>{t("voiceInput.card.noDescription")}</p>
        )}

        {(data.date ||
          data.priority ||
          (data.tags && data.tags.length > 0) ||
          (type === "reminder" && data.repeat_type && data.repeat_type !== "none")) && (
          <div className={cn("flex flex-wrap items-center gap-1.5 pt-2 border-t text-xs", INNER_CARD_BORDER)}>
            {data.date && (
              <div
                className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded", "bg-black/20 border border-white/10")}
              >
                <Calendar className={cn("h-3 w-3", SECONDARY_TEXT_COLOR)} />
                <span className={cn(PRIMARY_TEXT_COLOR, "text-xs")}>
                  {formatDateFns(new Date(data.date), "dd.MM.yy", { locale: currentDnsLocale })}
                  {type !== "note" && data.time ? ` ${data.time}` : ""}
                </span>
              </div>
            )}
            {data.priority && priorityLabels[data.priority] && (
              <div
                className={cn(
                  "flex items-center gap-1 px-1.5 py-0.5 rounded border",
                  priorityBadgeColors[data.priority],
                )}
              >
                <Flag className="h-3 w-3" />
                <span className="text-xs">{priorityLabels[data.priority]}</span>
              </div>
            )}
            {type === "reminder" &&
              data.repeat_type &&
              data.repeat_type !== "none" &&
              repeatTypeLabels[data.repeat_type] && (
                <div className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded border", repeatTypeBadgeColor)}>
                  <RepeatIcon className="h-3 w-3" />
                  <span className="text-xs">{repeatTypeLabels[data.repeat_type]}</span>
                </div>
              )}
            {data.tags &&
              data.tags.length > 0 &&
              data.tags.slice(0, 3).map((tag: string) => (
                <div
                  key={tag}
                  className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded", "bg-black/20 border border-white/10")}
                >
                  <Tag className={cn("h-3 w-3", SECONDARY_TEXT_COLOR)} />
                  <span className={cn(PRIMARY_TEXT_COLOR, "text-xs")}>{tag}</span>
                </div>
              ))}
          </div>
        )}

        {original_transcript && (
          <div className={cn("pt-2 border-t text-xs", INNER_CARD_BORDER, SECONDARY_TEXT_COLOR)}>
            <p className={cn("font-semibold mb-0.5", ACCENT_COLOR_TEXT)}>{t("voiceInput.card.recognizedTextLabel")}</p>
            <p
              className="italic opacity-90 max-h-16 overflow-y-auto custom-scrollbar-sm"
              style={{ wordBreak: "break-word" }}
            >
              {original_transcript}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export function VoiceInputOverlay({ isOpen, onClose }: VoiceInputOverlayProps) {
  const { t } = useLanguage() // Use language hook for translations
  const [currentStep, setCurrentStep] = useState<VoiceInputStep>("initializing")
  const [transcript, setTranscript] = useState("")
  const [aiResponseData, setAiResponseData] = useState<AiResponse | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [permissionError, setPermissionError] = useState(false)
  const [microphoneLevel, setMicrophoneLevel] = useState<number[]>(Array(20).fill(2))
  const [isSaving, setIsSaving] = useState(false)

  const recognitionRef = useRef<any | null>(null)
  const micCheckedRef = useRef(false)

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && !micCheckedRef.current) {
      micCheckedRef.current = true
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          stream.getTracks().forEach((track) => track.stop())
          setPermissionError(false)
          if (isOpen) setCurrentStep("readyToListen")
        })
        .catch((err) => {
          console.error("Нет доступа к микрофону:", err)
          setPermissionError(true)
          if (isOpen) setCurrentStep("permissionError")
        })
    } else if (isOpen && !permissionError) {
      if (currentStep === "initializing") setCurrentStep("readyToListen")
    }

    if (!isOpen) {
      setCurrentStep("initializing")
      setAiResponseData(null)
      setTranscript("")
      setAiError(null)
      setIsSaving(false)
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          /* ignore */
        }
        recognitionRef.current = null
      }
    }
  }, [isOpen, permissionError, currentStep])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (currentStep === "listening") {
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
  }, [currentStep])

  const handleStartRecording = () => {
    if (currentStep === "listening" || permissionError) return
    try {
      const SpeechRecognitionImpl = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognitionImpl) {
        setPermissionError(true)
        setCurrentStep("permissionError")
        console.error(t("voiceInput.status.browserNoSupport"))
        toast({
          title: t("voiceInput.toast.errorTitle"),
          description: t("voiceInput.status.browserNoSupport"),
          variant: "destructive",
        })
        return
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          /* ignore */
        }
      }
      recognitionRef.current = new SpeechRecognitionImpl()
      const recognition = recognitionRef.current!
      recognition.lang = "ru-RU" // This could be made dynamic with language context if needed
      recognition.interimResults = false
      setTranscript("")
      setAiResponseData(null)
      setAiError(null)
      setCurrentStep("listening")
      recognition.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1]
        if (lastResult.isFinal) {
          const recognizedText = lastResult[0].transcript.trim()
          if (recognizedText) {
            sendToGeminiInternal(recognizedText)
          } else {
            setCurrentStep("noSpeechDetected")
          }
        }
      }
      recognition.onerror = (event: any) => {
        console.log(`Ошибка распознавания: ${event.error}, Сообщение: ${event.message}`)
        if (event.error === "aborted") return
        if (event.error === "no-speech") setCurrentStep("noSpeechDetected")
        else if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setPermissionError(true)
          setCurrentStep("permissionError")
        } else {
          setAiError(
            `${t("voiceInput.status.aiErrorTitle")}: ${event.error}. ${event.message || t("voiceInput.button.retry")}`,
          )
          setCurrentStep("aiError")
        }
      }
      recognition.onend = () => {
        if (currentStep === "listening") {
          setCurrentStep("noSpeechDetected")
        }
      }
      recognition.start()
    } catch (error) {
      console.error("Ошибка при запуске распознавания:", error)
      setPermissionError(true)
      setCurrentStep("permissionError")
    }
  }

  const handleStopRecording = () => {
    if (recognitionRef.current && currentStep === "listening") {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        /* ignore */
      }
    }
  }

  const sendToGeminiInternal = async (text: string) => {
    setCurrentStep("sendingToAI")
    try {
      const structuredData = await generateStructuredEntry(text)
      setAiResponseData(structuredData)
      setTranscript(text)
      setCurrentStep("showingAIResponse")
    } catch (error: any) {
      setAiError(error.message || t("voiceInput.status.aiErrorDefault")) // Add a default AI error message key
      setTranscript(text)
      setCurrentStep("aiError")
    }
  }

  const handleCancel = () => {
    handleStopRecording()
    onClose()
  }

  const handleSave = async () => {
    if (!user || !user.login) {
      toast({
        title: t("voiceInput.toast.errorTitle"),
        description: t("voiceInput.toast.loginRequiredDesc"),
        variant: "destructive",
      })
      return
    }
    if (!aiResponseData || !aiResponseData.data || aiResponseData.type === "unknown") {
      toast({
        title: t("voiceInput.toast.noDataToSaveTitle"),
        description: t("voiceInput.toast.noDataToSaveDesc"),
        variant: "destructive",
      })
      return
    }
    setIsSaving(true)
    const { type, data } = aiResponseData
    const login = user.login
    const currentDate = new Date()
    const currentDateYYYYMMDD = currentDate.toISOString().split("T")[0]
    let payload: any = {}
    let apiUrl = ""
    let successMessageTitle = ""
    let successMessageDescription = ""
    const localizedType =
      type === "task"
        ? t("voiceInput.card.task")
        : type === "reminder"
          ? t("voiceInput.card.reminder")
          : t("voiceInput.card.note")

    try {
      switch (type) {
        case "task":
          apiUrl = "/api/tasks"
          payload = {
            login,
            title: data.title,
            description: data.description,
            date: data.date || currentDateYYYYMMDD,
            priority: data.priority,
            tags: data.tags || [],
          }
          successMessageTitle = t("voiceInput.toast.taskSavedTitle")
          successMessageDescription = t("voiceInput.toast.taskSavedDesc")
          break
        case "reminder":
          apiUrl = "/api/reminders"
          let reminderRepeatUntil = data.repeat_until
          if (data.repeat_type && data.repeat_type !== "none" && !data.repeat_until) {
            reminderRepeatUntil = currentDateYYYYMMDD
          }
          payload = {
            login,
            title: data.title,
            description: data.description,
            priority: data.priority,
            date: data.date || currentDateYYYYMMDD,
            time: data.time,
            repeat_type: data.repeat_type,
            repeat_days: data.repeat_days,
            repeat_until: reminderRepeatUntil,
            tags: data.tags || [],
          }
          successMessageTitle = t("voiceInput.toast.reminderSavedTitle")
          successMessageDescription = t("voiceInput.toast.reminderSavedDesc")
          break
        case "note":
          apiUrl = "/api/notes"
          payload = { login, title: data.title, content: data.content, tags: data.tags || [] }
          successMessageTitle = t("voiceInput.toast.noteSavedTitle")
          successMessageDescription = t("voiceInput.toast.noteSavedDesc")
          break
        default:
          toast({
            title: t("voiceInput.toast.unknownTypeTitle"),
            description: t("voiceInput.toast.unknownTypeDesc"),
            variant: "destructive",
          })
          setIsSaving(false)
          return
      }
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (response.ok) {
        toast({ title: successMessageTitle, description: successMessageDescription })
        onClose()
        window.location.reload()
      } else {
        const errorData = await response.json()
        toast({
          title: t("voiceInput.toast.saveErrorTitle"),
          description: errorData.message || t("voiceInput.toast.saveErrorDesc", { type: localizedType }),
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error(`Ошибка при сохранении ${type}:`, error)
      toast({
        title: t("voiceInput.toast.networkErrorTitle"),
        description: t("voiceInput.toast.networkErrorDesc", { type: localizedType }),
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleRetryVoiceInput = () => {
    if (currentStep !== "permissionError") {
      setCurrentStep("readyToListen")
      setAiResponseData(null)
      setTranscript("")
      setAiError(null)
    }
  }
  const handleRetryAISubmission = () => {
    if (transcript) {
      setAiResponseData(null)
      setAiError(null)
      sendToGeminiInternal(transcript)
    } else {
      handleRetryVoiceInput()
    }
  }

  const renderContent = () => {
    const iconSizeMic = "h-10 w-10"
    const iconSizeLarge = "h-10 w-10"
    const primaryButtonClass = cn(
      ACCENT_COLOR_BG,
      ACCENT_COLOR_BG_HOVER,
      PRIMARY_TEXT_COLOR,
      ACCENT_COLOR_SHADOW,
      "transition-colors duration-150 py-2.5 px-5 rounded-lg font-medium flex-1",
    )
    const secondaryButtonClass = cn(
      "bg-white/10",
      "border",
      "border-white/20",
      PRIMARY_TEXT_COLOR,
      "hover:bg-white/10",
      "transition-colors duration-150 py-2.5 px-5 rounded-lg font-medium flex-1",
    )

    let modalTitle = t("voiceInput.title.input")
    if (currentStep === "permissionError") modalTitle = t("voiceInput.title.permissionError")
    else if (currentStep === "showingAIResponse" || currentStep === "noSpeechDetected" || currentStep === "aiError")
      modalTitle = t("voiceInput.title.result")

    switch (currentStep) {
      case "initializing":
        return (
          <div className="flex flex-col items-center justify-center text-center h-full">
            <Loader className={cn(iconSizeLarge, "animate-spin", ACCENT_COLOR_TEXT, "mb-4")} />
            <p className={cn("text-lg", PRIMARY_TEXT_COLOR)}>{t("voiceInput.status.initializing")}</p>
          </div>
        )
      case "permissionError":
        return (
          <div className="flex flex-col items-center justify-center w-full py-8 text-center">
            <div className="bg-red-500/20 p-4 rounded-full mb-6">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h3 className={cn("text-lg font-medium mb-2", PRIMARY_TEXT_COLOR)}>
              {t("voiceInput.status.noMicAccessTitle")}
            </h3>
            <p className={cn("mb-6 text-center", SECONDARY_TEXT_COLOR)}>{t("voiceInput.status.noMicAccessDesc")}</p>
            <Button onClick={handleCancel} className={primaryButtonClass}>
              {t("voiceInput.button.close")}
            </Button>
          </div>
        )
      case "readyToListen":
        return (
          <div className="flex flex-col items-center justify-center text-center h-full py-4">
            <div className="relative mb-8">
              <motion.div
                animate={{ scale: 1, opacity: 0.7 }}
                className={cn("absolute inset-[-10px] rounded-full", ACCENT_COLOR_BG, "opacity-30")}
              />
              <motion.div
                animate={{ scale: 1, opacity: 0.9 }}
                className={cn("absolute inset-[-5px] rounded-full", ACCENT_COLOR_BG, "opacity-50")}
              />
              <Button
                size="lg"
                className={cn(
                  "h-24 w-24 rounded-full relative text-white shadow-lg",
                  ACCENT_COLOR_BG,
                  ACCENT_COLOR_BG_HOVER,
                  ACCENT_COLOR_SHADOW,
                )}
                onClick={handleStartRecording}
              >
                <Mic className={iconSizeMic} />
              </Button>
            </div>
            <BarVisualizer microphoneLevel={microphoneLevel} />
            <div className={cn("text-center", "text-white/80")}>{t("voiceInput.button.startRecordingPrompt")}</div>
          </div>
        )
      case "listening":
        return (
          <div className="flex flex-col items-center justify-center text-center h-full py-4">
            <div className="relative mb-8">
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0.5, 0.7] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "loop" }}
                className={cn("absolute inset-[-10px] rounded-full", ACCENT_COLOR_BG, "opacity-30")}
              />
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.9, 0.7, 0.9] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: "loop", delay: 0.2 }}
                className={cn("absolute inset-[-5px] rounded-full", ACCENT_COLOR_BG, "opacity-50")}
              />
              <Button
                size="lg"
                className={cn(
                  "h-24 w-24 rounded-full relative text-white shadow-lg",
                  ACCENT_COLOR_BG,
                  ACCENT_COLOR_BG_HOVER,
                  ACCENT_COLOR_SHADOW,
                  "ring-4",
                  ACCENT_COLOR_RING,
                )}
                onClick={handleStopRecording}
              >
                <Mic className={iconSizeMic} />
              </Button>
            </div>
            <BarVisualizer microphoneLevel={microphoneLevel} />
            <div className={cn("text-center", "text-white/80")}>
              <div className="flex items-center justify-center gap-2">
                <span className="animate-pulse">{t("voiceInput.button.listening")}</span>
                <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
              </div>
            </div>
          </div>
        )
      case "processingSpeech":
      case "sendingToAI":
        return (
          <div className="flex flex-col items-center justify-center text-center h-full">
            <Loader className={cn(iconSizeLarge, "animate-spin", ACCENT_COLOR_TEXT, "mb-4")} />
            <p className={cn("text-lg", PRIMARY_TEXT_COLOR)}>
              {currentStep === "processingSpeech"
                ? t("voiceInput.status.analyzingSpeech")
                : t("voiceInput.status.processingAI")}
            </p>
            {transcript && currentStep === "sendingToAI" && (
              <div
                className={cn(
                  "mt-4 p-3 w-full max-w-xs text-xs max-h-20 overflow-y-auto custom-scrollbar-sm",
                  INNER_CARD_BG,
                  INNER_CARD_BORDER,
                  INNER_CARD_ROUNDING,
                  SECONDARY_TEXT_COLOR,
                )}
              >
                <p className={cn("font-medium mb-1", ACCENT_COLOR_TEXT)}>{t("voiceInput.status.recognizedLabel")}</p>
                <p style={{ wordBreak: "break-word" }}>{transcript}</p>
              </div>
            )}
          </div>
        )
      case "noSpeechDetected":
        return (
          <div className="flex flex-col items-center justify-center w-full py-8 text-center">
            <div
              className={cn(
                "relative p-6 w-full max-w-sm shadow-inner mb-6",
                INNER_CARD_BG,
                INNER_CARD_BORDER,
                INNER_CARD_ROUNDING,
              )}
            >
              <div
                className={cn(
                  "absolute top-0 right-0 w-24 h-24 rounded-full blur-xl -z-10",
                  DECORATIVE_BLOB_BG,
                  "-translate-y-12 translate-x-12",
                )}
              />
              <div
                className={cn(
                  "absolute bottom-0 left-0 w-24 h-24 rounded-full blur-xl -z-10",
                  DECORATIVE_BLOB_BG,
                  "translate-y-12 -translate-x-12",
                )}
              />
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <p className="text-sm font-medium text-amber-500">{t("voiceInput.card.attention")}</p>
              </div>
              <p className={cn("text-lg font-medium relative z-10", PRIMARY_TEXT_COLOR)}>
                {t("voiceInput.status.noSpeechDetectedTitle")}
              </p>
              <p className={cn("text-sm mt-1", SECONDARY_TEXT_COLOR)}>{t("voiceInput.status.noSpeechDetectedDesc")}</p>
            </div>
            <div className="flex gap-4 w-full max-w-xs">
              <Button onClick={handleCancel} className={secondaryButtonClass}>
                {t("voiceInput.button.cancel")}
              </Button>
              <Button onClick={handleRetryVoiceInput} className={primaryButtonClass}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                {t("voiceInput.button.retry")}
              </Button>
            </div>
          </div>
        )
      case "aiError":
        return (
          <div className="flex flex-col items-center justify-center w-full py-8 text-center">
            <div
              className={cn(
                "relative p-6 w-full max-w-sm shadow-inner mb-6",
                INNER_CARD_BG,
                INNER_CARD_BORDER,
                INNER_CARD_ROUNDING,
              )}
            >
              <div
                className={cn(
                  "absolute top-0 right-0 w-24 h-24 rounded-full blur-xl -z-10",
                  DECORATIVE_BLOB_BG,
                  "-translate-y-12 translate-x-12",
                )}
              />
              <div
                className={cn(
                  "absolute bottom-0 left-0 w-24 h-24 rounded-full blur-xl -z-10",
                  DECORATIVE_BLOB_BG,
                  "translate-y-12 -translate-x-12",
                )}
              />
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-sm font-medium text-red-500">{t("voiceInput.toast.errorTitle")}</p>
              </div>
              <p className={cn("text-lg font-medium relative z-10 mb-2", PRIMARY_TEXT_COLOR)}>
                {t("voiceInput.status.aiErrorTitle")}
              </p>
              <p className={cn("text-sm max-h-20 overflow-y-auto custom-scrollbar-sm", SECONDARY_TEXT_COLOR)}>
                {aiError || t("voiceInput.status.aiErrorDefault")}
              </p>
              {transcript && (
                <div className={cn("mt-3 pt-3 border-t text-xs", INNER_CARD_BORDER, SECONDARY_TEXT_COLOR)}>
                  <p className={cn("font-medium mb-0.5", ACCENT_COLOR_TEXT)}>
                    {t("voiceInput.status.yourRequestLabel")}
                  </p>
                  <p className="italic" style={{ wordBreak: "break-word" }}>
                    {transcript}
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-3 w-full max-w-xs">
              <Button onClick={handleCancel} className={secondaryButtonClass}>
                {t("voiceInput.button.close")}
              </Button>
              <Button
                onClick={transcript ? handleRetryAISubmission : handleRetryVoiceInput}
                className={primaryButtonClass}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                {transcript ? t("voiceInput.button.retry") : t("voiceInput.button.newInput")}
              </Button>
            </div>
            {transcript && (
              <Button onClick={handleRetryVoiceInput} className={cn("w-full max-w-xs mt-3", primaryButtonClass)}>
                {t("voiceInput.button.newInput")}
              </Button>
            )}
          </div>
        )
      case "showingAIResponse":
        return (
          <div className="flex flex-col items-center justify-start text-left w-full h-full py-4">
            <div className="w-full max-w-md max-h-[calc(100%-70px)] overflow-y-auto custom-scrollbar-sm pr-1 mb-4">
              {aiResponseData ? (
                <AiResponsePreviewCard response={aiResponseData} />
              ) : (
                <div
                  className={cn(
                    "relative p-6 w-full shadow-inner text-left",
                    INNER_CARD_BG,
                    INNER_CARD_BORDER,
                    INNER_CARD_ROUNDING,
                  )}
                >
                  <div
                    className={cn(
                      "absolute w-28 h-28 rounded-full blur-2xl -z-10",
                      DECORATIVE_BLOB_BG,
                      "top-0 right-0 -translate-y-1/3 translate-x-1/3",
                    )}
                  />
                  <div
                    className={cn(
                      "absolute w-28 h-28 rounded-full blur-2xl -z-10",
                      DECORATIVE_BLOB_BG,
                      "bottom-0 left-0 translate-y-1/3 -translate-x-1/3",
                    )}
                  />
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    <p className="text-sm font-medium text-amber-500">{t("voiceInput.card.attention")}</p>
                  </div>
                  <p className={cn("text-lg font-medium relative z-10", PRIMARY_TEXT_COLOR)}>
                    {t("voiceInput.status.noDataOrError")}
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-4 w-full max-w-xs mt-auto pt-2">
              <Button onClick={handleCancel} className={secondaryButtonClass}>
                {t("voiceInput.button.cancel")}
              </Button>
              {aiResponseData && aiResponseData.data && aiResponseData.type !== "unknown" ? (
                <Button onClick={handleSave} className={primaryButtonClass} disabled={isSaving}>
                  {isSaving ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {isSaving ? t("voiceInput.button.saving") : t("voiceInput.button.save")}
                </Button>
              ) : (
                <Button onClick={handleRetryVoiceInput} className={primaryButtonClass}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  {t("voiceInput.button.rerecord")}
                </Button>
              )}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  let modalTitle = t("voiceInput.title.input")
  if (currentStep === "permissionError") modalTitle = t("voiceInput.title.permissionError")
  else if (currentStep === "showingAIResponse" || currentStep === "noSpeechDetected" || currentStep === "aiError")
    modalTitle = t("voiceInput.title.result")

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        <div className={cn("absolute inset-0", NEW_BACKDROP_BG, NEW_BACKDROP_BLUR)} onClick={handleCancel} />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={cn(
            "relative w-[90%] max-w-md p-6 sm:p-8 flex flex-col shadow-2xl",
            NEW_MODAL_BG,
            NEW_MODAL_BACKDROP_BLUR,
            NEW_MODAL_ROUNDING,
            NEW_MODAL_BORDER,
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full flex justify-between items-center mb-6 sm:mb-8">
            <div className={cn("text-lg font-medium", PRIMARY_TEXT_COLOR)}>{modalTitle}</div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className={cn(SECONDARY_TEXT_COLOR, "hover:text-white")}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-grow w-full flex flex-col justify-center overflow-hidden">{renderContent()}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
