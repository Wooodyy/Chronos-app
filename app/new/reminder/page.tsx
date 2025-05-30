"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ArrowLeft, Bell, Calendar, Clock, Flag, Tag, Plus, Save, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAuth } from "@/contexts/auth-context"
import type { PriorityLevel, RepeatType } from "@/types/entry"
import { useNotification } from "@/components/ui/notification"
import { useLanguage } from "@/contexts/language-context"

export default function NewReminderPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { showNotification } = useNotification()
  const { t, language } = useLanguage() // Добавляем language из контекста

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<PriorityLevel>("medium")
  const [date, setDate] = useState<Date>(new Date())
  const [time, setTime] = useState<string>(format(new Date(), "HH:mm"))
  const [repeatType, setRepeatType] = useState<RepeatType>("none")
  const [repeatDays, setRepeatDays] = useState<number[]>([])
  const [repeatUntil, setRepeatUntil] = useState<Date | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Refs для элементов редактирования
  const titleRef = useRef<HTMLInputElement>(null)

  // Эффект для автоматического обновления даты "Повторять до" при изменении даты события
  useEffect(() => {
    if (repeatType !== "none") {
      setRepeatUntil(new Date(date))
    }
  }, [date, repeatType])

  // Функция для локализованного форматирования даты
  const formatLocalizedDate = (date: Date) => {
    const day = date.getDate()
    const month = date.getMonth()
    const year = date.getFullYear()

    const monthNames = [
      "month.january",
      "month.february",
      "month.march",
      "month.april",
      "month.may",
      "month.june",
      "month.july",
      "month.august",
      "month.september",
      "month.october",
      "month.november",
      "month.december",
    ]

    const monthName = t(monthNames[month])
    return `${day} ${monthName} ${year}`
  }

  // Функция для получения локализованного плейсхолдера формата даты
  const getDateFormatPlaceholder = () => {
    switch (language) {
      case "ru":
        return "дд.мм.гггг"
      case "en":
        return "mm/dd/yyyy"
      case "kz":
        return "кк.аа.жжжж"
      default:
        return "дд.мм.гггг"
    }
  }

  // Обработчики изменений поле
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value)
  }

  const handlePriorityChange = (value: PriorityLevel) => {
    setPriority(value)
  }

  const handleDateChange = (newDate: Date) => {
    const updatedDate = new Date(date)
    updatedDate.setFullYear(newDate.getFullYear(), newDate.getMonth(), newDate.getDate())
    setDate(updatedDate)
  }

  const handleTimeChange = (newTime: string) => {
    setTime(newTime)

    // Обновляем дату с новым временем
    const [hours, minutes] = newTime.split(":").map(Number)
    const updatedDate = new Date(date)
    updatedDate.setHours(hours, minutes)
    setDate(updatedDate)
  }

  const handleRepeatTypeChange = (value: RepeatType) => {
    setRepeatType(value)
    if (value === "none") {
      setRepeatDays([])
      setRepeatUntil(null)
    } else {
      // Автоматически устанавливаем дату события как дату окончания повторения
      setRepeatUntil(new Date(date))
    }
  }

  const handleRepeatDayToggle = (day: number) => {
    setRepeatDays((current) => {
      if (current.includes(day)) {
        return current.filter((d) => d !== day)
      } else {
        return [...current, day].sort((a, b) => a - b)
      }
    })
  }

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()]
      setTags(updatedTags)
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove)
    setTags(updatedTags)
  }

  const handleNewTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      titleRef.current?.focus()
      showNotification(t("reminder.titleRequired"), "error")
      return
    }

    setIsSaving(true)
    setError(null)

    if (!user) {
      setError(t("reminder.authRequired"))
      setIsSaving(false)
      return
    }

    try {
      // Формируем данные для отправки
      const reminderData = {
        login: user.login,
        title,
        description,
        date: date.toISOString(),
        time: time,
        priority,
        repeat_type: repeatType,
        repeat_days: repeatType === "weekly" ? repeatDays : null,
        repeat_until: repeatUntil ? repeatUntil.toISOString() : null,
        tags,
      }

      // Отправляем данные на сервер
      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reminderData),
      })

      const data = await response.json()

      if (data.success) {
        showNotification(t("reminder.createSuccess"), "success")
        router.push("/reminders")
      } else {
        setError(data.message || t("reminder.createError"))
        showNotification(data.message || t("reminder.createError"), "error")
      }
    } catch (error) {
      console.error("Error creating reminder:", error)
      setError(t("reminder.createErrorGeneral"))
      showNotification(t("reminder.createErrorGeneral"), "error")
    } finally {
      setIsSaving(false)
    }
  }

  const priorityColors = {
    low: "text-green-600 dark:text-green-400",
    medium: "text-amber-600 dark:text-amber-400",
    high: "text-red-600 dark:text-red-400",
  }

  const priorityLabels = {
    low: t("reminder.priorityLow"),
    medium: t("reminder.priorityMedium"),
    high: t("reminder.priorityHigh"),
  }

  const repeatTypeLabels = {
    none: t("reminder.repeatNone"),
    daily: t("reminder.repeatDaily"),
    weekly: t("reminder.repeatWeekly"),
    monthly: t("reminder.repeatMonthly"),
  }

  const weekDays = [
    { value: 1, label: t("day.monday") },
    { value: 2, label: t("day.tuesday") },
    { value: 3, label: t("day.wednesday") },
    { value: 4, label: t("day.thursday") },
    { value: 5, label: t("day.friday") },
    { value: 6, label: t("day.saturday") },
    { value: 0, label: t("day.sunday") },
  ]

  return (
    <div className="flex flex-col min-h-full bg-background">
      {/* Mobile padding for header */}
      <div className="h-16 md:hidden" />

      <div className="flex-1 w-full">
        {/* Верхняя панель */}
        <div className="sticky top-0 z-30 flex items-center justify-between p-4 bg-background/95 backdrop-blur-md border-b shadow-sm">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push("/reminders")} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <Badge
              variant="outline"
              className="ml-2 h-9 px-4 bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 flex items-center"
            >
              <Bell className="h-4 w-4 mr-2" />
              {t("reminder.createNewReminder")}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              className="h-9 md:h-9 px-4 gap-1 bg-purple-600 hover:bg-purple-700 text-white font-medium"
              onClick={handleSubmit}
              disabled={isSaving || !title.trim()}
              style={{
                boxShadow: "0 0 15px rgba(147, 51, 234, 0.5)",
              }}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("reminder.creating")}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {t("reminder.create")}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Основное содержимое */}
        <div className="p-4 md:p-8 space-y-8">
          {error && (
            <div className="p-4 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 rounded-md">{error}</div>
          )}

          {/* Заголовок */}
          <div className="space-y-2">
            <Input
              ref={titleRef}
              value={title}
              onChange={handleTitleChange}
              className="text-3xl md:text-4xl font-bold tracking-tight border-none shadow-none p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
              placeholder={t("reminder.titlePlaceholder")}
            />
          </div>

          {/* Метаданные */}
          <div className="flex flex-wrap gap-4">
            {/* Дата */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 h-8">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatLocalizedDate(date)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-4">
                  <div className="grid gap-2">
                    <div className="grid gap-1">
                      <label className="text-sm font-medium">{t("reminder.date")}</label>
                      <Input
                        type="date"
                        value={format(date, "yyyy-MM-dd")}
                        onChange={(e) => {
                          const [year, month, day] = e.target.value.split("-").map(Number)
                          const newDate = new Date(date)
                          newDate.setFullYear(year, month - 1, day)
                          handleDateChange(newDate)
                        }}
                        placeholder={getDateFormatPlaceholder()}
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Время */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 h-8">
                  <Clock className="h-3.5 w-3.5" />
                  {time}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-4">
                  <div className="grid gap-2">
                    <div className="grid gap-1">
                      <label className="text-sm font-medium">{t("reminder.time")}</label>
                      <Input type="time" value={time} onChange={(e) => handleTimeChange(e.target.value)} />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Приоритет */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("gap-2 h-8", priorityColors[priority])}>
                  <Flag className="h-3.5 w-3.5" />
                  {priorityLabels[priority]}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn("w-full justify-start gap-2 mb-1", priorityColors.low)}
                    onClick={() => handlePriorityChange("low")}
                  >
                    <Flag className="h-3.5 w-3.5" />
                    {t("reminder.priorityLow")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn("w-full justify-start gap-2 mb-1", priorityColors.medium)}
                    onClick={() => handlePriorityChange("medium")}
                  >
                    <Flag className="h-3.5 w-3.5" />
                    {t("reminder.priorityMedium")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn("w-full justify-start gap-2", priorityColors.high)}
                    onClick={() => handlePriorityChange("high")}
                  >
                    <Flag className="h-3.5 w-3.5" />
                    {t("reminder.priorityHigh")}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Повторение */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 h-8">
                  <RefreshCw className="h-3.5 w-3.5" />
                  {repeatTypeLabels[repeatType]}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 mb-1"
                    onClick={() => handleRepeatTypeChange("none")}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    {t("reminder.repeatNone")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 mb-1"
                    onClick={() => handleRepeatTypeChange("daily")}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    {t("reminder.repeatDaily")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 mb-1"
                    onClick={() => handleRepeatTypeChange("weekly")}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    {t("reminder.repeatWeekly")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => handleRepeatTypeChange("monthly")}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    {t("reminder.repeatMonthly")}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Дни недели (только для еженедельного повторения) - улучшенный дизайн */}
          {repeatType === "weekly" && (
            <div className="pt-4 border-t">
              <div className="flex items-center mb-3">
                <RefreshCw className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">{t("reminder.weekDays")}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {weekDays.map((day) => {
                  const isSelected = repeatDays.includes(day.value)
                  return (
                    <div
                      key={day.value}
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-full cursor-pointer transition-all",
                        isSelected ? "bg-purple-600 text-white shadow-md" : "bg-secondary/20 hover:bg-secondary/40",
                      )}
                      onClick={() => handleRepeatDayToggle(day.value)}
                    >
                      {day.label}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Повторять до (для повторяющихся напоминаний) */}
          {repeatType !== "none" && (
            <div className="pt-4 border-t">
              <div className="flex items-center mb-3">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">{t("reminder.repeatUntil")}</span>
              </div>
              <div className="flex flex-wrap gap-4">
                {/* Дата окончания повторения */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 h-8">
                      <Calendar className="h-3.5 w-3.5" />
                      {repeatUntil ? formatLocalizedDate(repeatUntil) : t("reminder.selectDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-4">
                      <div className="grid gap-2">
                        <div className="grid gap-1">
                          <label className="text-sm font-medium">{t("reminder.date")}</label>
                          <Input
                            type="date"
                            value={repeatUntil ? format(repeatUntil, "yyyy-MM-dd") : ""}
                            onChange={(e) => {
                              if (e.target.value) {
                                const [year, month, day] = e.target.value.split("-").map(Number)
                                setRepeatUntil(new Date(year, month - 1, day))
                              } else {
                                setRepeatUntil(null)
                              }
                            }}
                            placeholder={getDateFormatPlaceholder()}
                          />
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {repeatUntil && (
                  <Button variant="outline" size="sm" className="gap-2 h-8" onClick={() => setRepeatUntil(null)}>
                    {t("reminder.clear")}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Описание */}
          <div className="pt-4 border-t">
            <Textarea
              value={description}
              onChange={handleDescriptionChange}
              className="min-h-[200px] resize-none border-none shadow-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-base"
              placeholder={t("reminder.addDescription")}
            />
          </div>

          {/* Теги */}
          <div className="pt-4 border-t">
            <div className="flex items-center mb-2">
              <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm font-medium">{t("reminder.tags")}</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="px-3 py-1 bg-secondary/50 hover:bg-secondary/70 transition-colors group"
                >
                  {tag}
                  <button
                    className="ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    ×
                  </button>
                </Badge>
              ))}

              <div className="flex items-center">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleNewTagKeyDown}
                  className="h-7 px-2 w-32 text-sm"
                  placeholder={t("reminder.newTag")}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 ml-1"
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile padding for bottom navigation */}
      <div className="h-20 md:hidden" />
    </div>
  )
}
