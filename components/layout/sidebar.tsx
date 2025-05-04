"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Calendar, Bell, BookMarked, User2, Mic, Menu, Moon, Sun, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "next-themes"
import { useAuth } from "@/contexts/auth-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

const menuItems = [
  { name: "Календарь", icon: Calendar, href: "/dashboard" },
  { name: "Напоминания", icon: Bell, href: "/reminders" },
  { name: "Заметки", icon: BookMarked, href: "/notes" },
  { name: "Профиль", icon: User2, href: "/profile" },
]

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 backdrop-blur-sm transition-transform hover:scale-110 active:scale-90"
    >
      {theme === "dark" ? <Moon className="h-5 w-5 text-yellow-300" /> : <Sun className="h-5 w-5 text-amber-500" />}
      <div
        className={cn(
          "absolute inset-0 rounded-full",
          theme === "dark"
            ? "shadow-[0_0_10px_2px_rgba(252,211,77,0.3),inset_0_0_4px_rgba(252,211,77,0.3)]"
            : "shadow-[0_0_10px_2px_rgba(245,158,11,0.3),inset_0_0_4px_rgba(245,158,11,0.3)]",
        )}
      />
    </button>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const [isRecording, setIsRecording] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [showTranscriptDialog, setShowTranscriptDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const { user, logout } = useAuth()
  const { theme } = useTheme()
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const SpeechRecognition: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

  // Инициализация распознавания речи
  useEffect(() => {
    // Проверяем поддержку браузером
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (SpeechRecognitionAPI) {
      const recognition: SpeechRecognition = new SpeechRecognitionAPI()

      // Настройка параметров
      recognition.lang = "ru-RU"
      recognition.continuous = false
      recognition.interimResults = false
      recognition.maxAlternatives = 1

      // Обработчик результатов
      recognition.onresult = (event) => {
        const result = event.results[event.resultIndex]
        if (result.isFinal) {
          const recognizedText = result[0].transcript
          setTranscript(recognizedText)
          console.log("Распознанный текст:", recognizedText)

          // Показываем диалог с распознанным текстом
          setIsProcessing(true)
          setShowTranscriptDialog(true)

          // Имитируем обработку текста
          setTimeout(() => {
            setIsProcessing(false)
          }, 2000)
        }
      }

      // Обработчик окончания распознавания
      recognition.onend = () => {
        setIsRecording(false)
        console.log("Распознавание завершено")
      }

      // Обработчик ошибок
      recognition.onerror = (event) => {
        console.error("Ошибка распознавания:", event.error, event.message)
        setIsRecording(false)
      }

      recognitionRef.current = recognition
    } else {
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
  }, [])

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      console.warn("Распознавание речи не поддерживается")
      return
    }

    if (isRecording) {
      // Остановка записи
      recognitionRef.current.stop()
      setIsRecording(false)
    } else {
      // Начало записи
      try {
        recognitionRef.current.start()
        setIsRecording(true)
        console.log("Начало распознавания речи...")
      } catch (error) {
        console.error("Ошибка при запуске распознавания:", error)
      }
    }
  }

  const handleLogout = () => {
    logout()
  }

  // Desktop sidebar
  const DesktopSidebar = (
    <div
      className={cn(
        "hidden md:flex flex-col h-screen relative overflow-hidden transition-[width] duration-300 ease-in-out",
        isCollapsed ? "w-24" : "w-80",
      )}
    >
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md z-0" />

      {/* Decorative elements - статические, без анимации */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-30 -translate-y-32 translate-x-32 z-0" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-30 translate-y-32 -translate-x-32 z-0" />

      {/* Border effect */}
      <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-primary/20 to-transparent z-0" />

      {/* Header */}
      <div className="relative flex items-center justify-between p-6 z-10">
        {!isCollapsed && (
          <div className="flex items-center gap-3 transition-opacity duration-300">
            <div className="relative">
              <Image
                src="/logo.png"
                alt="Chronos Logo"
                width={40}
                height={40}
                className="relative z-10 drop-shadow-[0_0_10px_rgba(139,92,246,0.7)]"
              />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Chronos
            </h1>
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 backdrop-blur-sm transition-transform hover:scale-110 active:scale-90"
        >
          <Menu className="h-5 w-5 text-primary" />
          <div className="absolute inset-0 rounded-full shadow-[0_0_10px_2px_rgba(139,92,246,0.3),inset_0_0_4px_rgba(139,92,246,0.3)]" />
        </button>
      </div>

      {/* Navigation */}
      <div className="relative flex-1 overflow-y-auto py-6 px-4 z-10 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "relative flex items-center gap-4 rounded-xl px-4 py-3 transition-all duration-200",
                    isCollapsed ? "justify-center" : "",
                    isActive
                      ? "text-primary dark:text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                    "hover:scale-[1.03] hover:bg-primary/5 active:scale-[0.98]",
                  )}
                >
                  {/* Active indicator - статический, без анимации */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-primary/10 dark:bg-primary/20 z-0 shadow-[0_0_20px_1px_rgba(139,92,246,0.2),inset_0_0_8px_rgba(139,92,246,0.1)]" />
                  )}

                  {/* Icon */}
                  <div className="relative z-10">
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-colors",
                        isActive
                          ? "text-primary dark:text-primary-foreground"
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                    />
                  </div>

                  {/* Text label */}
                  {!isCollapsed && (
                    <span
                      className={cn(
                        "text-sm font-medium relative z-10 transition-opacity duration-200",
                        isActive && "font-semibold",
                      )}
                    >
                      {item.name}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Voice input button */}
      <div className="relative p-4 z-10">
        {isCollapsed ? (
          <button
            onClick={handleVoiceInput}
            className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 backdrop-blur-sm mx-auto transition-transform hover:scale-110 active:scale-90"
          >
            <Mic
              className={cn(
                "h-5 w-5 transition-colors",
                isRecording ? "text-primary dark:text-primary-foreground" : "text-muted-foreground",
              )}
            />
            {isRecording && (
              <div className="absolute inset-0 rounded-full shadow-[0_0_15px_3px_rgba(139,92,246,0.5),inset_0_0_5px_rgba(139,92,246,0.5)]" />
            )}
          </button>
        ) : (
          <button
            onClick={handleVoiceInput}
            className="relative w-full overflow-hidden rounded-xl transition-transform hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]"
          >
            {/* Button background with gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary z-0" />

            {/* Glow effect - статический, без анимации */}
            <div className="absolute inset-0 shadow-[0_0_20px_5px_rgba(139,92,246,0.5),inset_0_0_10px_rgba(139,92,246,0.5)]" />

            {/* Content */}
            <div className="relative flex items-center gap-3 px-4 py-3 z-10">
              <div className="relative">
                <Mic className="h-5 w-5 text-white" />
                {isRecording && (
                  <div className="absolute -inset-2 rounded-full border-2 border-white/30 animate-pulse" />
                )}
              </div>
              <span className="text-sm font-medium text-white">{isRecording ? "Говорите..." : "Голосовой ввод"}</span>
            </div>
          </button>
        )}
      </div>

      {/* User profile */}
      {!isCollapsed ? (
        <div className="relative p-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/profile">
                <div className="relative transition-transform hover:scale-110 active:scale-95">
                  <Avatar className="cursor-pointer border-2 border-primary/20">
                    <AvatarImage src={user?.avatar ?? undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user?.firstName?.substring(0, 2) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 rounded-full shadow-[0_0_10px_2px_rgba(139,92,246,0.3),inset_0_0_4px_rgba(139,92,246,0.3)]" />
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.firstName || "Пользователь"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || "user@example.com"}</p>
              </div>
            </div>
            <div className="flex items-center">
              <ThemeToggle />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative p-4 z-10 flex justify-center">
          <Link href="/profile">
            <div className="relative transition-transform hover:scale-110 active:scale-95">
              <Avatar className="cursor-pointer border-2 border-primary/20">
                <AvatarImage src={user?.avatar ?? undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.firstName?.substring(0, 2) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full shadow-[0_0_10px_2px_rgba(139,92,246,0.3),inset_0_0_4px_rgba(139,92,246,0.3)]" />
            </div>
          </Link>
        </div>
      )}
    </div>
  )

  // Mobile header with glassmorphism
  const MobileHeader = (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 animate-slideDown">
      {/* Непрозрачный фон вместо glassmorphism */}
      <div className="absolute inset-0 bg-white dark:bg-zinc-900 border-b border-white/20 dark:border-zinc-800/20 z-0" />

      {/* Content */}
      <div className="relative flex items-center justify-between p-4 z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Image
              src="/logo.png"
              alt="Chronos Logo"
              width={32}
              height={32}
              className="relative z-10 drop-shadow-[0_0_10px_rgba(139,92,246,0.7)]"
            />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Chronos
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0 text-right">
            <p className="text-sm font-medium truncate">{user?.firstName || "Пользователь"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || "user@example.com"}</p>
          </div>
          <Link href="/profile">
            <div className="relative transition-transform hover:scale-110 active:scale-95">
              <Avatar className="h-9 w-9 cursor-pointer border-2 border-primary/20">
                <AvatarImage src={user?.avatar ?? undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.firstName?.substring(0, 2) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full shadow-[0_0_10px_2px_rgba(139,92,246,0.3),inset_0_0_4px_rgba(139,92,246,0.3)]" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  )

  // Минималистичное мобильное нижнее меню с особой анимацией для кнопки голосового ввода
  const MobileNav = (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 animate-slideUp">
      {/* Непрозрачный фон того же цвета, что и верхняя часть */}
      <div className="absolute inset-0 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 z-0" />

      {/* Навигационные элементы */}
      <nav className="relative flex items-center justify-around py-4 z-10">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href} className="flex justify-center items-center">
              <div className="relative flex items-center justify-center h-10 w-10">
                {/* Индикатор активного состояния - тонкая линия сверху */}
                {isActive && <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary" />}

                {/* Иконка */}
                <Icon
                  className={cn(
                    "h-7 w-7 transition-colors",
                    isActive ? "text-primary" : "text-gray-500 dark:text-gray-400",
                  )}
                />
              </div>
            </Link>
          )
        })}

        {/* Кнопка голосового ввода с такой же анимацией, как в десктопной версии */}
        <button onClick={handleVoiceInput} className="flex justify-center">
          <div className="relative flex flex-col items-center justify-center h-10 w-10">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 backdrop-blur-sm transition-transform hover:scale-110 active:scale-90">
              <Mic
                className={cn(
                  "h-6 w-6 transition-colors",
                  isRecording ? "text-primary dark:text-primary-foreground" : "text-muted-foreground",
                )}
              />
              {isRecording && (
                <div className="absolute inset-0 rounded-full shadow-[0_0_15px_3px_rgba(139,92,246,0.5),inset_0_0_5px_rgba(139,92,246,0.5)]" />
              )}
            </div>
          </div>
        </button>
      </nav>
    </div>
  )

  return (
    <>
      {DesktopSidebar}
      {MobileHeader}
      {MobileNav}

      {/* Модальное окно с распознанным текстом */}
      <Dialog open={showTranscriptDialog} onOpenChange={setShowTranscriptDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Распознанный текст
            </DialogTitle>
            <DialogDescription className="text-center">
              Ваше голосовое сообщение было успешно распознано
            </DialogDescription>
          </DialogHeader>

          <div className="relative p-6 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20 shadow-inner">
            {/* Декоративные элементы */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl opacity-30 -translate-y-16 translate-x-16 z-0" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl opacity-30 translate-y-16 -translate-x-16 z-0" />

            {/* Текст */}
            <p className="relative text-lg font-medium text-center z-10">
              {transcript || "Не удалось распознать текст"}
            </p>
          </div>

          {/* Анимация загрузки */}
          <div className="flex flex-col items-center justify-center mt-4">
            {isProcessing ? (
              <>
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">Обработка запроса...</p>
                </div>
                <div className="w-full mt-3">
                  <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full animate-pulse-width" />
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-primary font-medium">Готово к использованию</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
