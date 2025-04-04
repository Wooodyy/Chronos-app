"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Bell, BookMarked, User2, Mic, Menu, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
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
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 backdrop-blur-sm"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ opacity: 0, rotate: -180, scale: 0.5 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 180, scale: 0.5 }}
          transition={{ duration: 0.3 }}
        >
          {theme === "dark" ? <Moon className="h-5 w-5 text-yellow-300" /> : <Sun className="h-5 w-5 text-amber-500" />}
        </motion.div>
      </AnimatePresence>
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow:
            theme === "dark"
              ? "0 0 10px 2px rgba(252, 211, 77, 0.3), inset 0 0 4px rgba(252, 211, 77, 0.3)"
              : "0 0 10px 2px rgba(245, 158, 11, 0.3), inset 0 0 4px rgba(245, 158, 11, 0.3)",
        }}
        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
      />
    </motion.button>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const [isRecording, setIsRecording] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const { theme } = useTheme()

  const handleVoiceInput = () => {
    setIsRecording(!isRecording)
  }

  const handleLogout = () => {
    logout()
  }

  // Desktop sidebar
  const DesktopSidebar = (
    <motion.div
      className={cn(
        "hidden md:flex transition-all duration-500 ease-in-out flex-col h-screen relative overflow-hidden",
        isCollapsed ? "w-24" : "w-80",
      )}
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md z-0" />

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-30 -translate-y-32 translate-x-32 z-0" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-30 translate-y-32 -translate-x-32 z-0" />

      {/* Border effect */}
      <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-primary/20 to-transparent z-0" />

      {/* Header */}
      <div className="relative flex items-center justify-between p-6 z-10">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative flex h-10 w-10 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-primary/60 animate-pulse" />
                <span className="relative text-base font-bold text-white">C</span>
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    boxShadow: "0 0 15px 3px rgba(139, 92, 246, 0.5), inset 0 0 5px rgba(139, 92, 246, 0.5)",
                  }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                />
              </div>
              <motion.h1
                className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Chronos
              </motion.h1>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 backdrop-blur-sm"
        >
          <Menu className="h-5 w-5 text-primary" />
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: "0 0 10px 2px rgba(139, 92, 246, 0.3), inset 0 0 4px rgba(139, 92, 246, 0.3)",
            }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
          />
        </motion.button>
      </div>

      {/* Navigation */}
      <div className="relative flex-1 overflow-y-auto py-6 px-4 z-10 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        <nav className="space-y-2">
          <TooltipProvider delayDuration={0}>
            {menuItems.map((item, index) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link href={item.href}>
                      <motion.div
                        className={cn(
                          "relative flex items-center gap-4 rounded-xl px-4 py-3 transition-all",
                          isCollapsed ? "justify-center" : "",
                          isActive
                            ? "text-primary dark:text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        whileHover={{
                          scale: 1.03,
                          backgroundColor: isActive ? "rgba(139, 92, 246, 0.15)" : "rgba(139, 92, 246, 0.05)",
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Active indicator */}
                        {isActive && (
                          <>
                            <motion.div
                              layoutId="activeTabBackground"
                              className="absolute inset-0 rounded-xl bg-primary/10 dark:bg-primary/20 z-0"
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                            <motion.div
                              layoutId="activeTabIndicator"
                              className="absolute left-0 top-0 bottom-0 w-1 my-1 rounded-full bg-gradient-to-b from-primary via-primary to-primary/70"
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                            <motion.div
                              className="absolute inset-0 rounded-xl"
                              animate={{
                                boxShadow:
                                  "0 0 20px 1px rgba(139, 92, 246, 0.2), inset 0 0 8px rgba(139, 92, 246, 0.1)",
                              }}
                              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                            />
                          </>
                        )}

                        {/* Icon with glow effect */}
                        <div className="relative z-10">
                          <Icon
                            className={cn(
                              "h-5 w-5 transition-colors",
                              isActive
                                ? "text-primary dark:text-primary-foreground"
                                : "text-muted-foreground group-hover:text-foreground",
                            )}
                          />
                          {isActive && (
                            <motion.div
                              className="absolute inset-0 rounded-full"
                              animate={{
                                boxShadow: "0 0 8px 2px rgba(139, 92, 246, 0.4)",
                              }}
                              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                            />
                          )}
                        </div>

                        {/* Text label */}
                        <AnimatePresence>
                          {!isCollapsed && (
                            <motion.span
                              className={cn("text-sm font-medium relative z-10", isActive && "font-semibold")}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              transition={{ duration: 0.2 }}
                            >
                              {item.name}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </Link>
                  </TooltipTrigger>
                  {isCollapsed && <TooltipContent side="right">{item.name}</TooltipContent>}
                </Tooltip>
              )
            })}
          </TooltipProvider>
        </nav>
      </div>

      {/* Voice input button */}
      <div className="relative p-4 z-10">
        {isCollapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleVoiceInput}
                  className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 backdrop-blur-sm mx-auto"
                >
                  <Mic
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isRecording ? "text-primary dark:text-primary-foreground" : "text-muted-foreground",
                    )}
                  />
                  {isRecording && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      animate={{
                        boxShadow: "0 0 15px 3px rgba(139, 92, 246, 0.5), inset 0 0 5px rgba(139, 92, 246, 0.5)",
                      }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                    />
                  )}
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="right">Голосовой ввод</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleVoiceInput}
            className="relative w-full overflow-hidden rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {/* Button background with gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary z-0" />

            {/* Animated glow effect */}
            <motion.div
              className="absolute inset-0"
              animate={{
                boxShadow: "0 0 20px 5px rgba(139, 92, 246, 0.5), inset 0 0 10px rgba(139, 92, 246, 0.5)",
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
            />

            {/* Animated shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
              animate={{ x: ["calc(-100% - 50px)", "calc(100% + 50px)"] }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
                ease: "easeInOut",
                delay: 0.5,
              }}
            />

            {/* Content */}
            <div className="relative flex items-center gap-3 px-4 py-3 z-10">
              <div className="relative">
                <Mic className="h-5 w-5 text-white" />
                {isRecording && (
                  <motion.div
                    className="absolute -inset-2 rounded-full border-2 border-white/30"
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
              </div>
              <span className="text-sm font-medium text-white">Голосовой ввод</span>
            </div>
          </motion.button>
        )}
      </div>

      {/* User profile */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            className="relative p-4 z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href="/profile">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="relative">
                    <Avatar className="cursor-pointer border-2 border-primary/20">
                      <AvatarImage src={user?.avatar ?? undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user?.name?.substring(0, 2) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      animate={{
                        boxShadow: "0 0 10px 2px rgba(139, 92, 246, 0.3), inset 0 0 4px rgba(139, 92, 246, 0.3)",
                      }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                    />
                  </motion.div>
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name || "Пользователь"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email || "user@example.com"}</p>
                </div>
              </div>
              <div className="flex items-center">
                <ThemeToggle />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )

  // Mobile header with glassmorphism
  const MobileHeader = (
    <motion.div
      className="md:hidden fixed top-0 left-0 right-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Glassmorphism background with more depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/90 to-white/70 dark:from-zinc-900/90 dark:to-zinc-900/70 backdrop-blur-xl border-b border-white/20 dark:border-zinc-800/20 z-0" />

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl opacity-30 -translate-y-20 translate-x-20 z-0" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl opacity-30 translate-y-10 -translate-x-20 z-0" />

      {/* Content */}
      <div className="relative flex items-center justify-between p-4 z-10">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-primary/60 animate-pulse" />
            <span className="relative text-sm font-bold text-white">C</span>
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: "0 0 15px 3px rgba(139, 92, 246, 0.5), inset 0 0 5px rgba(139, 92, 246, 0.5)",
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
            />
          </div>
          <motion.h1
            className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Chronos
          </motion.h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0 text-right">
            <p className="text-sm font-medium truncate">{user?.name || "Пользователь"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || "user@example.com"}</p>
          </div>
          <Link href="/profile">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="relative">
              <Avatar className="h-9 w-9 cursor-pointer border-2 border-primary/20">
                <AvatarImage src={user?.avatar ?? undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.name?.substring(0, 2) || "U"}
                </AvatarFallback>
              </Avatar>
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  boxShadow: "0 0 10px 2px rgba(139, 92, 246, 0.3), inset 0 0 4px rgba(139, 92, 246, 0.3)",
                }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
              />
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.div>
  )

  // Mobile bottom navigation with glassmorphism
  const MobileNav = (
    <motion.div
      className="md:hidden fixed bottom-0 left-0 right-0 w-full z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border-t border-white/20 dark:border-zinc-800/20 z-0" />
  
      {/* Content */}
      <nav className="relative grid grid-cols-5 w-full py-2 px-0 gap-1 z-10">
        {menuItems.map((item, index) => {
          const Icon = item.icon
          const isActive = pathname === item.href
  
          return (
            <Link key={item.href} href={item.href} className="flex justify-center">
              <motion.div
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-all w-16",
                  isActive ? "text-primary dark:text-primary-foreground" : "text-muted-foreground"
                )}
                whileHover={{ 
                  scale: 1.1, 
                  y: -2,
                  transition: { duration: 0.2 } 
                }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <span className="relative flex justify-center">
                  <Icon 
                    className={cn(
                      "h-5 w-5 transition-all duration-300 relative z-10",
                      isActive ? "text-background-foreground dark:text-primary-foreground scale-110" : "text-muted-foreground"
                    )} 
                  />
                  {isActive && (
                    <>
                      {/* Статичное свечение */}
                      <motion.div
                        className="absolute inset-[-10px] z-0"
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: 0.8,
                          background: "radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, rgba(139, 92, 246, 0) 70%)",
                        }}
                      />
                      {/* Внутреннее свечение иконки */}
                      <motion.div
                        className="absolute inset-[-2px] rounded-full z-0"
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: 0.7,
                          boxShadow: "0 0 12px 4px rgba(139, 92, 246, 0.4), inset 0 0 4px rgba(139, 92, 246, 0.4)",
                        }}
                      />
                    </>
                  )}
                </span>
                <motion.span 
                  className={cn(
                    "text-xs font-medium transition-all duration-300",
                    isActive ? "text-background-foreground dark:text-primary-foreground font-semibold" : "text-muted-foreground"
                  )}
                >
                  {item.name}
                </motion.span>
              </motion.div>
            </Link>
          )
        })}
        <motion.button
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleVoiceInput}
          className={cn(
            "flex flex-col items-center gap-1 p-2 rounded-lg transition-all w-16",
            isRecording ? "text-primary dark:text-primary-foreground" : "text-muted-foreground",
          )}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: menuItems.length * 0.1, duration: 0.5 }}
        >
          <span className="relative flex justify-center">
            <Mic className="h-5 w-5" />
            {isRecording && (
              <motion.div
                className="absolute -inset-1 rounded-full"
                animate={{
                  boxShadow: "0 0 15px 3px rgba(139, 92, 246, 0.5), inset 0 0 5px rgba(139, 92, 246, 0.5)",
                }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
              />
            )}
          </span>
          <span className="text-xs font-medium">Голос</span>
        </motion.button>
      </nav>
    </motion.div>
  )

  return (
    <>
      {DesktopSidebar}
      {MobileHeader}
      {MobileNav}
    </>
  )
}

