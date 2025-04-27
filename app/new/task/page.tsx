"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { ArrowLeft, ListTodo, Calendar, Clock, Flag, Tag, Plus, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAuth } from "@/contexts/auth-context"
import type { PriorityLevel } from "@/types/entry"

// Импортируем хук для уведомлений
import { useNotification } from "@/components/ui/notification"

export default function NewTaskPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<PriorityLevel>("medium")
  const [date, setDate] = useState<Date>(new Date())
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Refs для элементов редактирования
  const titleRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)

  // Добавляем использование хука в компоненте
  const { showNotification } = useNotification()

  // Обработчики изменений полей
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

  const handleTimeChange = (hours: number, minutes: number) => {
    const updatedDate = new Date(date)
    updatedDate.setHours(hours, minutes)
    setDate(updatedDate)
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

  // Обновляем функцию handleSubmit
  const handleSubmit = async () => {
    if (!title.trim()) {
      titleRef.current?.focus()
      showNotification("Пожалуйста, введите заголовок задачи", "error")
      return
    }

    setIsSaving(true)
    setError(null)

    if (!user) {
      setError("Вы должны быть авторизованы для создания задачи")
      setIsSaving(false)
      return
    }

    try {
      // Преобразуем теги из строки в массив
      const tagArray = tags || []

      // Отправляем данные на сервер
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login: user.login,
          title,
          description,
          date: date.toISOString(),
          priority,
          tags: tagArray,
        }),
      })

      const data = await response.json()

      if (data.success) {
        showNotification("Задача успешно создана", "success")
        router.push("/dashboard")
      } else {
        setError(data.message || "Не удалось создать задачу")
        showNotification(data.message || "Не удалось создать задачу", "error")
      }
    } catch (error) {
      console.error("Error creating task:", error)
      setError("Произошла ошибка при создании задачи")
      showNotification("Произошла ошибка при создании задачи", "error")
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
    low: "Низкий",
    medium: "Средний",
    high: "Высокий",
  }

  return (
    <div className="flex flex-col min-h-full bg-background">
      {/* Mobile padding for header */}
      <div className="h-16 md:hidden" />

      <div className="flex-1 max-w-4xl mx-auto w-full">
        {/* Верхняя панель */}
        <div className="sticky top-0 z-30 flex items-center justify-between p-4 bg-background/95 backdrop-blur-md border-b shadow-sm">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <Badge
              variant="outline"
              className="ml-2 h-9 px-4 bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center"
            >
              <ListTodo className="h-4 w-4 mr-2" />
              Новая задача
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
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Сохранить
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
              placeholder="Без заголовка"
            />
          </div>

          {/* Метаданные */}
          <div className="flex flex-wrap gap-4">
            {/* Дата */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 h-8">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(date, "d MMMM yyyy", { locale: ru })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-4">
                  <div className="grid gap-2">
                    <div className="grid gap-1">
                      <label className="text-sm font-medium">Дата</label>
                      <Input
                        type="date"
                        value={format(date, "yyyy-MM-dd")}
                        onChange={(e) => {
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
                  {format(date, "HH:mm", { locale: ru })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-4">
                  <div className="grid gap-2">
                    <div className="grid gap-1">
                      <label className="text-sm font-medium">Время</label>
                      <Input
                        type="time"
                        value={format(date, "HH:mm")}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(":").map(Number)
                          handleTimeChange(hours, minutes)
                        }}
                      />
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
                    Низкий
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn("w-full justify-start gap-2 mb-1", priorityColors.medium)}
                    onClick={() => handlePriorityChange("medium")}
                  >
                    <Flag className="h-3.5 w-3.5" />
                    Средний
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn("w-full justify-start gap-2", priorityColors.high)}
                    onClick={() => handlePriorityChange("high")}
                  >
                    <Flag className="h-3.5 w-3.5" />
                    Высокий
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Описание */}
          <div className="pt-4 border-t">
            <Textarea
              ref={descriptionRef}
              value={description}
              onChange={handleDescriptionChange}
              className="min-h-[200px] resize-none border-none shadow-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-base"
              placeholder="Добавьте описание..."
            />
          </div>

          {/* Теги */}
          <div className="pt-4 border-t">
            <div className="flex items-center mb-2">
              <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm font-medium">Теги</span>
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
                  placeholder="Новый тег"
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
