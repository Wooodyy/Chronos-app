"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Bell, BookMarked, User2, Mic, Menu, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useTheme } from "next-themes"
import { useAuth } from "@/contexts/auth-context"

const menuItems = [
  { name: "Главная", icon: Calendar, href: "/dashboard" },
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
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-full"
    >
      {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const [isRecording, setIsRecording] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { user, logout } = useAuth()

  const handleVoiceInput = () => {
    setIsRecording(!isRecording)
  }

  // Desktop sidebar
  const DesktopSidebar = (
    <div
      className={cn(
        "hidden md:flex border-r bg-card shadow-sm transition-all duration-300 ease-in-out flex-col h-screen",
        isCollapsed ? "w-20" : "w-72",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <span className="text-sm font-bold text-primary-foreground">C</span>
            </div>
            <h1 className="text-xl font-bold text-primary-foreground">Chronos</h1>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="ml-auto">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-2">
          <TooltipProvider delayDuration={0}>
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                        isActive
                          ? "text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTabDesktop"
                          className="absolute left-0 top-0 bottom-0 my-auto w-1 h-6 bg-primary rounded-full"
                          transition={{ type: "spring", duration: 0.5 }}
                        />
                      )}
                      <Icon className={cn("h-5 w-5", isActive && "text-primary-foreground")} />
                      {!isCollapsed && <span>{item.name}</span>}
                    </Link>
                  </TooltipTrigger>
                  {isCollapsed && <TooltipContent side="right">{item.name}</TooltipContent>}
                </Tooltip>
              )
            })}
          </TooltipProvider>
        </nav>
      </div>

      <div className="p-4 border-t">
        {isCollapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleVoiceInput}
                  className={cn("w-full flex justify-center relative", isRecording && "text-primary-foreground")}
                >
                  <Mic className="h-5 w-5" />
                  {isRecording && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-primary/30"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.5, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Голосовой ввод</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleVoiceInput}
            className="flex w-full items-center gap-3 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <span className="relative">
              <Mic className="h-5 w-5" />
              {isRecording && (
                <motion.div
                  className="absolute -inset-2 rounded-full border-2 border-primary-foreground/30"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
              )}
            </span>
            Голосовой ввод
          </motion.button>
        )}
      </div>

      {!isCollapsed && (
        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/profile">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Avatar className="cursor-pointer">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>{user?.name?.substring(0, 2) || "U"}</AvatarFallback>
                  </Avatar>
                </motion.div>
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || "Пользователь"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || "user@example.com"}</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      )}
    </div>
  )

  // Mobile header and navigation
  const MobileHeader = (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass-effect">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <span className="text-sm font-bold text-primary-foreground">C</span>
          </div>
          <h1 className="text-xl font-bold text-primary-foreground">Chronos</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0 text-right">
            <p className="text-sm font-medium truncate">{user?.name || "Пользователь"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || "user@example.com"}</p>
          </div>
          <Link href="/profile">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{user?.name?.substring(0, 2) || "U"}</AvatarFallback>
              </Avatar>
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  )

  // Mobile bottom navigation
  const MobileNav = (
    <div className="md:hidden fixed bottom-0 left-0 right-0 w-full glass-effect z-50">
      <nav className="flex justify-evenly items-center w-full">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-lg transition-colors w-1/5 text-center",
                isActive ? "text-primary-foreground" : "text-muted-foreground",
              )}
            >
              <span className="relative flex justify-center">
                <Icon className="h-5 w-5" />
                {isActive && (
                  <motion.div
                    layoutId="activeTabMobile"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
              </span>
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          )
        })}
        <button
          onClick={handleVoiceInput}
          className={cn(
            "flex flex-col items-center gap-1 p-3 rounded-lg transition-colors w-1/5 text-center",
            isRecording ? "text-primary-foreground" : "text-muted-foreground",
          )}
        >
          <span className="relative flex justify-center">
            {isRecording ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="relative">
                <Mic className="h-5 w-5" />
                <motion.div
                  className="absolute -inset-2 rounded-full border-2 border-primary/30"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </span>
          <span className="text-xs font-medium">Голос</span>
        </button>
      </nav>
    </div>
  )

  return (
    <>
      {DesktopSidebar}
      {MobileHeader}
      {MobileNav}
    </>
  )
}

