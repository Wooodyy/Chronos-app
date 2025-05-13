"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Calendar, Bell, BookMarked, User2, Mic, Menu, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "next-themes"
import { useAuth } from "@/contexts/auth-context"
import { VoiceInputOverlay } from "./voice-input-overlay"

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
  const [isVoiceOverlayOpen, setIsVoiceOverlayOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [transcript, setTranscript] = useState("")
  const { user, logout } = useAuth()

  const handleVoiceInput = () => {
    setIsVoiceOverlayOpen(true)
  }

  const handleVoiceOverlayClose = () => {
    setIsVoiceOverlayOpen(false)
  }

  const handleTextRecognized = (text: string) => {
    setTranscript(text)
    console.log("Распознанный текст в сайдбаре:", text)
    // Здесь можно добавить логику обработки распознанного текста
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
            <Mic className="h-5 w-5 text-white" />
            <div className="absolute inset-0 rounded-full shadow-[0_0_15px_3px_rgba(139,92,246,0.5),inset_0_0_5px_rgba(139,92,246,0.5)]" />
          </button>
        ) : ( 
          <button
            onClick={handleVoiceInput}
            className="relative flex w-full max-w-xs items-center justify-start gap-3 rounded-xl bg-primary/10 dark:bg-primary/20 backdrop-blur-sm px-4 py-3 text-left transition-transform hover:scale-105 active:scale-90"
          >
            <Mic className="h-5 w-5 text-white" />
            <span className="text-sm font-medium text-white">Голосовой ввод</span>
            <div className="absolute inset-0 rounded-xl shadow-[0_0_15px_3px_rgba(139,92,246,0.5),inset_0_0_5px_rgba(139,92,246,0.5)]" />
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
                {isActive && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary shadow-[0_0_4px_1px_rgba(139,92,246,0.6)] transition-all duration-300" />
                )}

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
              <Mic className="h-6 w-6 text-white" />
              <div className="absolute inset-0 rounded-full shadow-[0_0_15px_3px_rgba(139,92,246,0.5),inset_0_0_5px_rgba(139,92,246,0.5)]" />
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

      {/* Voice Input Overlay */}
      <VoiceInputOverlay
        isOpen={isVoiceOverlayOpen}
        onClose={handleVoiceOverlayClose}
        onTextRecognized={handleTextRecognized}
      />
    </>
  )
}
