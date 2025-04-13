"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { motion } from "framer-motion"
import {
  User2,
  Mail,
  LogOut,
  Calendar,
  Bell,
  Moon,
  Sun,
  Edit,
  Save,
  Camera,
  Activity,
  Loader2,
  AtSign,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import { useAuth } from "@/contexts/auth-context"
import { ImageCropper } from "@/components/features/profile/image-cropper"
import { useNotification } from "@/components/ui/notification"
import { cn } from "@/lib/utils"
import { PasswordForm } from "@/components/features/profile/password-form"

// Contribution graph component
const ContributionGraph = () => {
  const currentYear = new Date().getFullYear()
  const months = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"]
  const days = ["Пн", "Ср", "Пт"]

  // Generate contribution data - a fixed pattern that matches the screenshot
  const generateContributions = () => {
    // Create a 7x52 grid (7 days per week, 52 weeks per year)
    const contributions = []

    // For each week (column)
    for (let week = 0; week < 52; week++) {
      const weekData = []

      // For each day (row)
      for (let day = 0; day < 7; day++) {
        // Generate a random level (0-4) with higher probability for lower values
        const rand = Math.random()
        let level
        if (rand < 0.6)
          level = 0 // 60% chance of level 0
        else if (rand < 0.75)
          level = 1 // 15% chance of level 1
        else if (rand < 0.85)
          level = 2 // 10% chance of level 2
        else if (rand < 0.95)
          level = 3 // 10% chance of level 3
        else level = 4 // 5% chance of level 4

        weekData.push(level)
      }
      contributions.push(weekData)
    }

    return contributions
  }

  const contributions = generateContributions()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Активность за последний год</h3>
        <div className="text-sm text-muted-foreground">{currentYear}</div>
      </div>

      <div className="relative overflow-x-auto pb-10">
        {/* Days of week labels - positioned to align with rows */}
        <div className="absolute left-0 top-0 flex flex-col justify-between h-[140px] py-[6px]">
          <span className="text-xs text-muted-foreground pr-2">{days[0]}</span>
          <span className="text-xs text-muted-foreground pr-2">{days[1]}</span>
          <span className="text-xs text-muted-foreground pr-2">{days[2]}</span>
        </div>

        <div className="ml-8 min-w-[700px]">
          {/* Month labels */}
          <div className="grid grid-cols-12 mb-2">
            {months.map((month, i) => (
              <span key={i} className="text-xs text-muted-foreground text-center">
                {month}
              </span>
            ))}
          </div>

          {/* Contribution grid */}
          <div className="grid grid-rows-7 grid-flow-col gap-1">
            {Array.from({ length: 7 }).map((_, rowIndex) => (
              <div key={rowIndex} className="flex gap-1">
                {contributions.map((week, weekIndex) => (
                  <div
                    key={weekIndex}
                    className={cn(
                      "w-3 h-3 rounded-full",
                      isDark
                        ? ["bg-zinc-800", "bg-purple-900/40", "bg-purple-700/60", "bg-purple-600/80", "bg-purple-500"][
                            week[rowIndex]
                          ]
                        : ["bg-zinc-200", "bg-purple-300/40", "bg-purple-400/60", "bg-purple-500/80", "bg-purple-600"][
                            week[rowIndex]
                          ],
                    )}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend - positioned at the bottom right */}
          <div className="absolute bottom-0 right-0 flex items-center text-xs text-muted-foreground mt-4">
            <span>Меньше</span>
            <div className="flex gap-1 mx-2">
              <div className={cn("w-3 h-3 rounded-full", isDark ? "bg-zinc-800" : "bg-zinc-200")} />
              <div className={cn("w-3 h-3 rounded-full", isDark ? "bg-purple-900/40" : "bg-purple-300/40")} />
              <div className={cn("w-3 h-3 rounded-full", isDark ? "bg-purple-700/60" : "bg-purple-400/60")} />
              <div className={cn("w-3 h-3 rounded-full", isDark ? "bg-purple-600/80" : "bg-purple-500/80")} />
              <div className={cn("w-3 h-3 rounded-full", isDark ? "bg-purple-500" : "bg-purple-600")} />
            </div>
            <span>Больше</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Activity overview component
const ActivityOverview = () => {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">Обзор активности</h3>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-primary" />
          <div>
            <div className="text-sm font-medium">Создано 12 задач</div>
            <div className="text-xs text-muted-foreground">За последний месяц</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-emerald-500" />
          <div>
            <div className="text-sm font-medium">Завершено 8 задач</div>
            <div className="text-xs text-muted-foreground">За последний месяц</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-amber-500" />
          <div>
            <div className="text-sm font-medium">Создано 5 напоминаний</div>
            <div className="text-xs text-muted-foreground">За последний месяц</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { user, logout, updateUserData } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showNotification } = useNotification()
  const userDataRefreshedRef = useRef(false)
  const router = useRouter()

  // Состояние для формы
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Состояние для обрезки изображения
  const [cropperOpen, setCropperOpen] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  // Предотвращаем гидрацию
  useEffect(() => {
    setMounted(true)

    // Заполняем форму данными пользователя
    if (user) {
      if (user.firstName) setFirstName(user.firstName)
      if (user.lastName) setLastName(user.lastName)
      if (user.email) setEmail(user.email)
      if (user.avatar) setAvatarPreview(user.avatar)
    }
  }, [user])

  // Обновляем данные пользователя при первом рендере страницы
  useEffect(() => {
    if (user && !userDataRefreshedRef.current) {
      userDataRefreshedRef.current = true

      // Используем setTimeout, чтобы избежать циклических обновлений
      const timer = setTimeout(() => {
        updateUserData()
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [user, updateUserData])

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Показываем уведомление
        showNotification("Данные профиля успешно обновлены", "success")

        // Обновляем данные пользователя
        await updateUserData()
        setIsEditingProfile(false)
      } else {
        // Показываем уведомление об ошибке
        showNotification(data.message || "Не удалось обновить профиль", "error")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      // Показываем уведомление об ошибке
      showNotification("Произошла ошибка при обновлении профиля", "error")
    } finally {
      setIsSaving(false)
    }
  }

  // Обработчик клика по кнопке загрузки аватара
  const handleAvatarButtonClick = () => {
    fileInputRef.current?.click()
  }

  // Обработчик изменения файла аватара
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]

    // Проверка типа файла
    if (!file.type.startsWith("image/")) {
      showNotification("Пожалуйста, выберите изображение", "error")
      return
    }

    // Проверка размера файла (не более 5 МБ)
    if (file.size > 5 * 1024 * 1024) {
      showNotification("Размер файла не должен превышать 5 МБ", "error")
      return
    }

    // Создаем превью изображения для обрезки
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageToCrop(event.target.result as string)
        setCropperOpen(true)
      }
    }
    reader.readAsDataURL(file)

    // Сбрасываем значение input, чтобы можно было загрузить тот же файл повторно
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Обработчик завершения обрезки
  const handleCropComplete = async (croppedImage: string) => {
    if (!user) return

    setCropperOpen(false)
    setAvatarPreview(croppedImage)
    setIsUploadingAvatar(true)

    try {
      // Преобразуем base64 в Blob
      const response = await fetch(croppedImage)
      const blob = await response.blob()

      // Создаем файл из Blob
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" })

      // Создаем FormData и добавляем файл
      const formData = new FormData()
      formData.append("avatar", file)

      // Отправляем на сервер
      const uploadResponse = await fetch(`/api/users/${user.id}/avatar`, {
        method: "POST",
        body: formData,
      })

      const data = await uploadResponse.json()

      if (data.success) {
        // Показываем уведомление
        showNotification("Аватар успешно обновлен", "success")

        // Обновляем данные пользователя
        await updateUserData()
      } else {
        // Показываем уведомление об ошибке
        showNotification(data.message || "Не удалось обновить аватар", "error")
      }
    } catch (error) {
      console.error("Error uploading avatar:", error)
      // Показываем уведомление об ошибке
      showNotification("Произошла ошибка при загрузке аватара", "error")
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // Обработчик отмены обрезки
  const handleCropCancel = () => {
    setCropperOpen(false)
    setImageToCrop(null)
  }

  // Форматирование даты создания аккаунта
  const formatCreatedAt = () => {
    if (!user?.created_at) return "недавно"

    try {
      const date = new Date(user.created_at)
      return format(date, "dd.MM.yyyy")
    } catch (error) {
      return "недавно"
    }
  }

  if (!user) return null

  return (
    <div className="flex flex-col min-h-full">
      {/* Mobile padding for header */}
      <div className="h-16 md:hidden" />

      <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {/* Profile Header - Hero Section */}
        <div className="relative w-full mb-8">
          {/* Enhanced professional banner */}
          <div className="w-full h-48 rounded-xl overflow-hidden relative">
            {/* Base gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#8b5cf6]/40 via-[#6366f1]/30 to-[#a78bfa]/20 dark:from-[#8b5cf6]/60 dark:via-[#6366f1]/50 dark:to-[#a78bfa]/40" />

            {/* Subtle overlay patterns */}
            <div
              className="absolute inset-0 opacity-10 dark:opacity-20"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%239C92AC' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
              }}
            />

            {/* Glass effect overlay */}
            <div className="absolute inset-0 bg-white/10 dark:bg-black/10"></div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#8b5cf6]/20 rounded-full opacity-30 -translate-y-32 translate-x-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#8b5cf6]/20 rounded-full opacity-30 translate-y-32 -translate-x-32" />

            {/* Enhanced animated particles with professional look */}
            <motion.div
              className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full bg-[#8b5cf6]/40 dark:bg-[#8b5cf6]/60"
              animate={{
                y: [0, -20, 0],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute top-1/3 right-1/3 w-6 h-6 rounded-full bg-[#6366f1]/30 dark:bg-[#6366f1]/50"
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 1,
              }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-5 h-5 rounded-full bg-[#a78bfa]/50 dark:bg-[#a78bfa]/70"
              animate={{
                y: [0, -25, 0],
                opacity: [0.5, 0.9, 0.5],
              }}
              transition={{
                duration: 3.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />

            {/* Additional particles with professional colors */}
            <motion.div
              className="absolute top-1/2 left-1/3 w-3 h-3 rounded-full bg-[#818cf8]/40 dark:bg-[#818cf8]/60"
              animate={{
                x: [0, 20, 0],
                y: [0, -15, 0],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 0.2,
              }}
            />
            <motion.div
              className="absolute top-2/3 right-1/4 w-4 h-4 rounded-full bg-[#c4b5fd]/40 dark:bg-[#c4b5fd]/60"
              animate={{
                x: [0, -25, 0],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 4.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 1.5,
              }}
            />
            <motion.div
              className="absolute bottom-1/3 left-1/2 w-5 h-5 rounded-full bg-[#ddd6fe]/30 dark:bg-[#ddd6fe]/50"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 0.7,
              }}
            />
            <motion.div
              className="absolute top-1/3 left-2/3 w-6 h-6 rounded-full bg-[#ede9fe]/20 dark:bg-[#ede9fe]/40"
              animate={{
                y: [0, 20, 0],
                x: [0, 15, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 6,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 2,
              }}
            />
            <motion.div
              className="absolute bottom-1/2 right-1/3 w-3 h-3 rounded-full bg-[#8b5cf6]/40 dark:bg-[#8b5cf6]/60"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 1.2,
              }}
            />

            {/* Professional geometric elements */}
            <motion.div
              className="absolute top-1/4 right-1/5 w-8 h-8 rounded-md rotate-45 border border-[#8b5cf6]/30 dark:border-[#8b5cf6]/50"
              animate={{
                rotate: [45, 90, 45],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-1/4 left-1/5 w-10 h-10 rounded-full border-2 border-[#8b5cf6]/20 dark:border-[#8b5cf6]/40"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 7,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 1,
              }}
            />

            {/* Elegant line elements */}
            <motion.div
              className="absolute top-1/3 left-1/4 w-20 h-[1px] bg-[#8b5cf6]/30 dark:bg-[#8b5cf6]/50"
              animate={{
                scaleX: [1, 1.5, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-1/3 right-1/4 w-16 h-[1px] bg-[#8b5cf6]/30 dark:bg-[#8b5cf6]/50"
              animate={{
                scaleX: [1, 1.3, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 6,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />

            {/* Subtle dot patterns */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-1/4 left-1/3 w-1 h-1 rounded-full bg-white dark:bg-white/70"></div>
              <div className="absolute top-1/3 left-1/4 w-1 h-1 rounded-full bg-white dark:bg-white/70"></div>
              <div className="absolute top-1/2 left-1/5 w-1 h-1 rounded-full bg-white dark:bg-white/70"></div>
              <div className="absolute top-2/3 left-1/3 w-1 h-1 rounded-full bg-white dark:bg-white/70"></div>
              <div className="absolute top-3/4 left-1/2 w-1 h-1 rounded-full bg-white dark:bg-white/70"></div>
              <div className="absolute top-1/4 right-1/3 w-1 h-1 rounded-full bg-white dark:bg-white/70"></div>
              <div className="absolute top-1/3 right-1/4 w-1 h-1 rounded-full bg-white dark:bg-white/70"></div>
              <div className="absolute top-1/2 right-1/5 w-1 h-1 rounded-full bg-white dark:bg-white/70"></div>
              <div className="absolute top-2/3 right-1/3 w-1 h-1 rounded-full bg-white dark:bg-white/70"></div>
              <div className="absolute top-3/4 right-1/2 w-1 h-1 rounded-full bg-white dark:bg-white/70"></div>
            </div>
          </div>

          {/* Profile info overlay */}
          <div className="absolute -bottom-16 left-8 flex items-end">
            <div className="relative group">
              <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                <AvatarImage src={avatarPreview || user?.avatar || undefined} />
                <AvatarFallback className="text-3xl bg-primary/10">{user?.name?.substring(0, 2) || "U"}</AvatarFallback>
              </Avatar>
              <button
                className="absolute bottom-2 right-2 bg-[#8b5cf6] text-white rounded-full p-2 transition-transform hover:scale-110 active:scale-95 shadow-[0_0_15px_rgba(139,92,246,0.7)] w-8 h-8 flex items-center justify-center"
                onClick={handleAvatarButtonClick}
                disabled={isUploadingAvatar}
              >
                {isUploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={isUploadingAvatar}
              />
            </div>
          </div>
        </div>

        {/* Profile content with spacing for avatar */}
        <div className="mt-20">
          {/* User info section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">{user.name || "Пользователь"}</h1>
            <h2 className="text-xl text-muted-foreground mb-4 flex items-center gap-2">
              <AtSign className="h-4 w-4" />
              {user.login || "@username"}
            </h2>

            <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-muted-foreground mt-4">
              {user.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Присоединился {formatCreatedAt()}</span>
              </div>
            </div>
          </div>

          {/* Main content with sidebar layout */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar navigation */}
            <div className="md:w-1/4">
              <div className="sticky top-24 space-y-1">
                <Button
                  variant={activeTab === "overview" ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start transition-all duration-300",
                    activeTab === "overview"
                      ? "bg-[#8b5cf6] text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                      : "hover:bg-[#8b5cf6]/10 hover:text-[#8b5cf6] hover:shadow-[0_0_10px_rgba(139,92,246,0.2)]",
                  )}
                  onClick={() => setActiveTab("overview")}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Обзор
                </Button>
                <Button
                  variant={activeTab === "account" ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start transition-all duration-300",
                    activeTab === "account"
                      ? "bg-[#8b5cf6] text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                      : "hover:bg-[#8b5cf6]/10 hover:text-[#8b5cf6] hover:shadow-[0_0_10px_rgba(139,92,246,0.2)]",
                  )}
                  onClick={() => setActiveTab("account")}
                >
                  <User2 className="h-4 w-4 mr-2" />
                  Аккаунт
                </Button>
                <Button
                  variant={activeTab === "notifications" ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start transition-all duration-300",
                    activeTab === "notifications"
                      ? "bg-[#8b5cf6] text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                      : "hover:bg-[#8b5cf6]/10 hover:text-[#8b5cf6] hover:shadow-[0_0_10px_rgba(139,92,246,0.2)]",
                  )}
                  onClick={() => setActiveTab("notifications")}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Уведомления
                </Button>
                <Separator className="my-2" />
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 hover:shadow-[0_0_10px_rgba(239,68,68,0.2)] transition-all duration-300"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Выйти
                </Button>
              </div>
            </div>

            {/* Main content area */}
            <div className="flex-1">
              {/* Overview tab */}
              {activeTab === "overview" && (
                <div className="space-y-8">
                  <Card className="border-none shadow-lg overflow-hidden bg-white/80 dark:bg-zinc-900/80">
                    <CardContent className="p-6">
                      <ContributionGraph />
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-none shadow-lg overflow-hidden bg-white/80 dark:bg-zinc-900/80">
                      <CardContent className="p-6">
                        <ActivityOverview />
                      </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg overflow-hidden bg-white/80 dark:bg-zinc-900/80">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Популярные теги</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20">
                            работа
                          </Badge>
                          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20">
                            важное
                          </Badge>
                          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20">
                            срочно
                          </Badge>
                          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20">
                            встреча
                          </Badge>
                          <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20">
                            личное
                          </Badge>
                          <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20">
                            проект
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Account tab */}
              {activeTab === "account" && (
                <Card className="border-none shadow-lg overflow-hidden bg-white/80 dark:bg-zinc-900/80">
                  <CardContent className="p-6 space-y-6">
                    <h3 className="text-xl font-semibold">Информация профиля</h3>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Имя</Label>
                        <div className="flex items-center">
                          <User2 className="h-4 w-4 mr-2 text-muted-foreground" />
                          <Input
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            disabled={!isEditingProfile}
                            className={
                              isEditingProfile
                                ? "border-[#8b5cf6]/50 focus:border-[#8b5cf6] shadow-[0_0_10px_rgba(139,92,246,0.1)]"
                                : ""
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName">Фамилия</Label>
                        <div className="flex items-center">
                          <User2 className="h-4 w-4 mr-2 text-muted-foreground" />
                          <Input
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            disabled={!isEditingProfile}
                            className={
                              isEditingProfile
                                ? "border-[#8b5cf6]/50 focus:border-[#8b5cf6] shadow-[0_0_10px_rgba(139,92,246,0.1)]"
                                : ""
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          <Input
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={!isEditingProfile}
                            className={
                              isEditingProfile
                                ? "border-[#8b5cf6]/50 focus:border-[#8b5cf6] shadow-[0_0_10px_rgba(139,92,246,0.1)]"
                                : ""
                            }
                          />
                        </div>
                      </div>

                      <div className="flex justify-end mt-4">
                        {isEditingProfile ? (
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              onClick={() => setIsEditingProfile(false)}
                              className="shadow-md hover:shadow-lg transition-shadow"
                            >
                              Отмена
                            </Button>
                            <Button
                              onClick={handleSave}
                              disabled={isSaving}
                              className="bg-[#8b5cf6] hover:bg-[#7c3aed] shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-shadow"
                            >
                              {isSaving ? (
                                <>Сохранение...</>
                              ) : (
                                <>
                                  <Save className="h-4 w-4 mr-2" />
                                  Сохранить
                                </>
                              )}
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => setIsEditingProfile(true)}
                            className="bg-[#8b5cf6] hover:bg-[#7c3aed] shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-shadow"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Редактировать
                          </Button>
                        )}
                      </div>
                    </div>

                    <Separator className="my-6" />
                    <PasswordForm />
                  </CardContent>
                </Card>
              )}

              {/* Notifications tab */}
              {activeTab === "notifications" && (
                <Card className="border-none shadow-lg overflow-hidden bg-white/80 dark:bg-zinc-900/80">
                  <CardContent className="p-6 space-y-6">
                    <h3 className="text-xl font-semibold">Настройки уведомлений</h3>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email уведомления</p>
                          <p className="text-sm text-muted-foreground">Получать уведомления по электронной почте</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Напоминания о задачах</p>
                          <p className="text-sm text-muted-foreground">Получать напоминания о предстоящих задачах</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      {mounted && (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Темная тема</p>
                            <p className="text-sm text-muted-foreground">Переключение между светлой и темной темой</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <motion.div
                              initial={false}
                              animate={{ rotate: theme === "dark" ? 360 : 0 }}
                              transition={{ duration: 0.5, type: "spring" }}
                            >
                              {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                            </motion.div>
                            <Switch
                              checked={theme === "dark"}
                              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image cropper component */}
      {imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          open={cropperOpen}
        />
      )}

      {/* Mobile padding for bottom navigation */}
      <div className="h-20 md:hidden" />
    </div>
  )
}
