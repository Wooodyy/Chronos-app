"use client"

import type React from "react"

import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { ru, kk, enUS } from "date-fns/locale"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Bell,
  Trash2,
  Loader2,
  Tag,
  Flag,
  MoreHorizontal,
  Plus,
  Save,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useState, useEffect, useRef } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Entry, PriorityLevel, RepeatType } from "@/types/entry"
import { useNotification } from "@/components/ui/notification"
import { useLanguage } from "@/contexts/language-context"

export default function ReminderPage() {
  const router = useRouter()
  const params = useParams()
  const { t, language } = useLanguage()
  const [reminder, setReminder] = useState<Entry | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Состояния для редактируемых полей
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<PriorityLevel>("medium")
  const [date, setDate] = useState<Date | null>(null)
  const [time, setTime] = useState<string>("")
  const [repeatType, setRepeatType] = useState<RepeatType>("none")
  const [repeatDays, setRepeatDays] = useState<number[]>([])
  const [repeatUntil, setRepeatUntil] = useState<Date | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  // Состояние для отслеживания изменений
  const [isEdited, setIsEdited] = useState(false)

  // Refs для элементов редактирования
  const titleRef = useRef<HTMLInputElement>(null)

  // Добавляем использование хука в компоненте
  const { showNotification } = useNotification()

  const [source, setSource] = useState("dashboard")

  // Функция для получения локали даты
  const getDateLocale = () => {
    switch (language) {
      case "ru":
        return ru
      case "kz":
        return kk
      case "en":
        return enUS
      default:
        return ru
    }
  }

  useEffect(() => {
    // Get the source from URL query parameters
    const urlParams = new URLSearchParams(window.location.search)
    const sourceParam = urlParams.get("source")
    if (sourceParam) {
      setSource(sourceParam)
    }
  }, [])

  useEffect(() => {
    const fetchReminder = async () => {
      setIsLoading(true)

      try {
        const response = await fetch(`/api/reminders/${params.id}`)
        const data = await response.json()

        if (data.success && data.reminder) {
          setReminder(data.reminder)
          initializeFormFields(data.reminder)
        } else {
          // Если не нашли напоминание, перенаправляем на список напоминаний
          router.push("/reminders")
        }
      } catch (error) {
        console.error("Error fetching reminder:", error)
        router.push("/reminders")
      } finally {
        setIsLoading(false)
      }
    }

    fetchReminder()
  }, [params.id, router])

  // Функция для инициализации полей формы
  const initializeFormFields = (reminder: Entry) => {
    setTitle(reminder.title)
    setDescription(reminder.description || "")

    // Проверяем, что приоритет является допустимым значением
    const reminderPriority = reminder.priority || "medium"
    if (reminderPriority === "low" || reminderPriority === "medium" || reminderPriority === "high") {
      setPriority(reminderPriority as PriorityLevel)
    } else {
      setPriority("medium")
    }

    // Устанавливаем дату
    setDate(new Date(reminder.date))

    // Устанавливаем время из поля time
    setTime(reminder.time || format(new Date(reminder.date), "HH:mm"))

    // Устанавливаем тип повторения
    setRepeatType(reminder.repeat_type || "none")

    // Устанавливаем дни повторения
    setRepeatDays(reminder.repeat_days || [])

    // Устанавливаем дату окончания повторения
    setRepeatUntil(reminder.repeat_until ? new Date(reminder.repeat_until) : null)

    // Устанавливаем теги
    setTags(reminder.tags || [])

    // Сбрасываем флаг изменений
    setIsEdited(false)
  }

  // Обработчики изменений полей
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    setIsEdited(true)
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value)
    setIsEdited(true)
  }

  const handlePriorityChange = (value: PriorityLevel) => {
    setPriority(value)
    setIsEdited(true)
  }

  const handleDateChange = (newDate: Date) => {
    if (!date) return

    const updatedDate = new Date(date)
    updatedDate.setFullYear(newDate.getFullYear(), newDate.getMonth(), newDate.getDate())

    setDate(updatedDate)
    setIsEdited(true)
  }

  const handleTimeChange = (newTime: string) => {
    setTime(newTime)
    setIsEdited(true)

    // Обновляем дату с новым временем
    if (date) {
      const [hours, minutes] = newTime.split(":").map(Number)
      const updatedDate = new Date(date)
      updatedDate.setHours(hours, minutes)
      setDate(updatedDate)
    }
  }

  const handleRepeatTypeChange = (value: RepeatType) => {
    setRepeatType(value)
    if (value === "none") {
      setRepeatDays([])
      setRepeatUntil(null)
    }
    setIsEdited(true)
  }

  const handleRepeatDayToggle = (day: number) => {
    setRepeatDays((current) => {
      if (current.includes(day)) {
        return current.filter((d) => d !== day)
      } else {
        return [...current, day].sort((a, b) => a - b)
      }
    })
    setIsEdited(true)
  }

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()]
      setTags(updatedTags)
      setNewTag("")
      setIsEdited(true)
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove)
    setTags(updatedTags)
    setIsEdited(true)
  }

  const handleNewTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">{t("reminder.loading")}</p>
      </div>
    )
  }

  if (!reminder) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Bell className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold">{t("reminder.notFound")}</h2>
        <p className="text-muted-foreground text-center max-w-md">{t("reminder.notFoundDesc")}</p>
        <Button onClick={() => router.push("/reminders")} className="mt-4">
          {t("reminder.backToReminders")}
        </Button>
      </div>
    )
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

  // Обновляем функцию handleDelete
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/reminders/${reminder.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        showNotification(t("reminder.deleteSuccess"), "success")
        router.push(source === "reminders" ? "/reminders" : "/dashboard")
      } else {
        showNotification(t("reminder.deleteError"), "error")
      }
    } catch (error) {
      console.error("Error deleting reminder:", error)
      showNotification(t("reminder.deleteErrorGeneral"), "error")
    }
  }

  // Функция для сохранения изменений
  const handleSave = async () => {
    if (!reminder || !date) return

    setIsSaving(true)
    setError(null)

    try {
      // Отправляем данные на сервер
      const response = await fetch(`/api/reminders/${reminder.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          date: date.toISOString(),
          time: time,
          priority,
          repeat_type: repeatType,
          repeat_days: repeatType === "weekly" ? repeatDays : null,
          repeat_until: repeatUntil ? repeatUntil.toISOString() : null,
          tags,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.message || t("reminder.updateError"))
        showNotification(data.message || t("reminder.updateError"), "error")
        setIsSaving(false)
        return
      } else {
        // Обновляем локальное состояние
        setReminder({
          ...reminder,
          title,
          description,
          date,
          time,
          priority,
          repeat_type: repeatType,
          repeat_days: repeatDays,
          repeat_until: repeatUntil ?? undefined,
          tags,
        })
        showNotification(t("reminder.updateSuccess"), "success")
      }

      // Обновляем время последнего сохранения
      setLastSaved(new Date())

      // Сбрасываем флаг изменений
      setIsEdited(false)
    } catch (error) {
      console.error("Error updating reminder:", error)
      setError(t("reminder.updateErrorGeneral"))
      showNotification(t("reminder.updateErrorGeneral"), "error")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col min-h-full bg-background">
      {/* Mobile padding for header */}
      <div className="h-16 md:hidden" />

      <div className="flex-1 w-full">
        {/* Верхняя панель */}
        <div className="sticky top-0 z-30 flex items-center justify-between p-4 bg-background/95 backdrop-blur-md border-b shadow-sm">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(source === "reminders" ? "/reminders" : "/dashboard")}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <Badge
              variant="outline"
              className="ml-2 h-9 px-4 bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 flex items-center"
            >
              <Bell className="h-4 w-4 mr-2" />
              {t("reminder.reminder")}
            </Badge>

            {lastSaved && (
              <span className="text-xs text-muted-foreground ml-2 hidden md:inline">
                {t("reminder.saved", { time: format(lastSaved, "HH:mm", { locale: getDateLocale() }) })}
              </span>
            )}

            {isSaving && (
              <div className="flex items-center text-xs text-muted-foreground ml-2 hidden md:flex">
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                {t("reminder.saving")}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isEdited && (
              <Button
                variant="default"
                size="sm"
                className="h-9 md:h-9 px-4 gap-1 bg-purple-600 hover:bg-purple-700 text-white font-medium"
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  boxShadow: "0 0 15px rgba(147, 51, 234, 0.5)",
                }}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("reminder.saving")}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {t("reminder.save")}
                  </>
                )}
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 flex items-center justify-center">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("reminder.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
              placeholder={t("reminder.noTitle")}
            />
          </div>

          {/* Метаданные */}
          <div className="flex flex-wrap gap-4">
            {/* Дата */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 h-8">
                  <Calendar className="h-3.5 w-3.5" />
                  {date ? format(date, "d MMMM yyyy", { locale: getDateLocale() }) : t("reminder.selectDate")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-4">
                  <div className="grid gap-2">
                    <div className="grid gap-1">
                      <label className="text-sm font-medium">{t("reminder.date")}</label>
                      <Input
                        type="date"
                        value={date ? format(date, "yyyy-MM-dd") : ""}
                        onChange={(e) => {
                          if (!date) return
                          const [year, month, day] = e.target.value.split("-").map(Number)
                          const newDate = new Date(date)
                          newDate.setFullYear(year, month - 1, day)
                          handleDateChange(newDate)
                        }}
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
              <div className="flex items-center gap-2">
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
                  className="w-auto"
                />
                {repeatUntil && (
                  <Button variant="ghost" size="sm" className="h-9 px-2" onClick={() => setRepeatUntil(null)}>
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
              placeholder={t("reminder.addDescription")}
              className="min-h-[200px] resize-none border-none shadow-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-base"
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("reminder.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("reminder.deleteConfirmDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("reminder.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {t("reminder.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
