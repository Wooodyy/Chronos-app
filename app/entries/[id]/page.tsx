"use client"

import type React from "react"

import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  ListTodo,
  Circle,
  Trash2,
  Loader2,
  Tag,
  Flag,
  MoreHorizontal,
  Plus,
  Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { entries } from "@/data/entries"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Entry, PriorityLevel } from "@/types/entry"
import { RichTextEditor } from "@/components/features/editor/rich-text-editor"

// Импортируем хук для уведомлений
import { useNotification } from "@/components/ui/notification"

export default function EntryPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useParams()
  const [source, setSource] = useState("dashboard")
  const [entry, setEntry] = useState<Entry | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Состояния для редактируемых полей
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<PriorityLevel>("medium")
  const [date, setDate] = useState<Date | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  // Состояние для отслеживания изменений
  const [isEdited, setIsEdited] = useState(false)

  // Refs для элементов редактирования
  const titleRef = useRef<HTMLInputElement>(null)

  // Добавляем использование хука в компоненте
  const { showNotification } = useNotification()

  useEffect(() => {
    // Get the source from URL query parameters
    const urlParams = new URLSearchParams(window.location.search)
    const sourceParam = urlParams.get("source")
    if (sourceParam) {
      setSource(sourceParam)
    }

    const fetchEntry = async () => {
      setIsLoading(true)

      // Сначала ищем в статическом массиве напоминания и заметки
      const staticEntry = entries.find((e) => e.id === params.id && (e.type === "reminder" || e.type === "note"))

      if (staticEntry) {
        setEntry(staticEntry)
        setIsCompleted(staticEntry.completed || false)
        initializeFormFields(staticEntry)
        setIsLoading(false)
        return
      }

      // Если не нашли в статическом массиве, ищем задачу в базе данных
      try {
        const response = await fetch(`/api/tasks/${params.id}`)
        const data = await response.json()

        if (data.success && data.task) {
          setEntry(data.task)
          setIsCompleted(data.task.completed || false)
          initializeFormFields(data.task)
        } else {
          // Если не нашли нигде, перенаправляем на дашборд
          router.push("/dashboard")
        }
      } catch (error) {
        console.error("Error fetching entry:", error)
        router.push("/dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEntry()
  }, [params.id, router])

  // Функция для инициализации полей формы
  const initializeFormFields = (task: Entry) => {
    setTitle(task.title)
    setDescription(task.description || "")

    // Проверяем, что приоритет является допустимым значением
    const taskPriority = task.priority || "medium"
    if (taskPriority === "low" || taskPriority === "medium" || taskPriority === "high") {
      setPriority(taskPriority as PriorityLevel)
    } else {
      setPriority("medium")
    }

    // Устанавливаем дату
    setDate(new Date(task.date))

    // Устанавливаем теги
    setTags(task.tags || [])

    // Сбрасываем флаг изменений
    setIsEdited(false)
  }

  // Обработчики изменений полей
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    setIsEdited(true)
  }

  const handleDescriptionChange = (html: string) => {
    setDescription(html)
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

  const handleTimeChange = (hours: number, minutes: number) => {
    if (!date) return

    const updatedDate = new Date(date)
    updatedDate.setHours(hours, minutes)

    setDate(updatedDate)
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
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    )
  }

  if (!entry) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Calendar className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold">Запись не найдена</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Запись, которую вы ищете, не суще��твует или была удалена.
        </p>
        <Button onClick={() => router.back()} className="mt-4">
          Вернуться назад
        </Button>
      </div>
    )
  }

  const typeLabels = {
    task: "Задача",
    reminder: "Напоминание",
    note: "Заметка",
  }

  const typeColors = {
    task: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
    reminder: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
    note: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
  }

  const typeIcons = {
    task: ListTodo,
    reminder: Clock,
    note: Calendar,
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

  const Icon = typeIcons[entry.type]

  // Обновляем функцию handleDelete
  const handleDelete = async () => {
    // If this is a task from the database
    if (entry.type === "task" && !entries.find((e) => e.id === entry.id)) {
      try {
        const response = await fetch(`/api/tasks/${entry.id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          showNotification("Запись успешно удалена", "success")
          if (source === "notes") {
            router.push("/notes")
          } else if (source === "tasks") {
            router.push("/tasks")
          } else {
            router.push("/dashboard")
          }
        } else {
          showNotification("Не удалось удалить запись", "error")
        }
      } catch (error) {
        console.error("Error deleting task:", error)
        showNotification("Ошибка при удалении записи", "error")
      }
    } else {
      // For static entries just redirect
      console.log("Deleting entry:", entry.id)
      showNotification("Запись успешно удалена", "success")
      if (source === "notes") {
        router.push("/notes")
      } else if (source === "tasks") {
        router.push("/tasks")
      } else {
        router.push("/dashboard")
      }
    }
  }

  // Обновляем функцию toggleComplete
  const toggleComplete = async () => {
    // Если это задача из базы данных
    if (entry.type === "task" && !entries.find((e) => e.id === entry.id)) {
      try {
        const response = await fetch(`/api/tasks/${entry.id}/complete`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ completed: !isCompleted }),
        })

        if (response.ok) {
          setIsCompleted(!isCompleted)
          showNotification(`Задача отмечена как ${!isCompleted ? "выполненная" : "невыполненная"}`, "success")
        } else {
          showNotification("Не удалось обновить статус задачи", "error")
        }
      } catch (error) {
        console.error("Error updating task:", error)
        showNotification("Ошибка при обновлении статуса задачи", "error")
      }
    } else {
      // Для статических записей просто меняем состояние
      setIsCompleted(!isCompleted)
      showNotification(`Задача отмечена как ${!isCompleted ? "выполненная" : "невыполненная"}`, "success")
    }
  }

  // Функция для сохранения изменений
  const handleSave = async () => {
    if (!entry || !date) return

    setIsSaving(true)
    setError(null)

    try {
      // Если это задача из базы данных
      if (entry.type === "task" && !entries.find((e) => e.id === entry.id)) {
        // Отправляем данные на сервер
        const response = await fetch(`/api/tasks/${entry.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            description,
            date: date.toISOString(),
            priority,
            tags,
          }),
        })

        const data = await response.json()

        if (!data.success) {
          setError(data.message || "Не удалось обновить задачу")
          showNotification(data.message || "Не удалось обновить задачу", "error")
          setIsSaving(false)
          return
        } else {
          // Обновляем локальное состояние
          setEntry({
            ...entry,
            title,
            description,
            date,
            priority,
            tags,
          })
          showNotification("Задача успешно обновлена", "success")
        }
      } else {
        // Для статических записей просто имитируем сохранение
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Обновляем локальное состояние
        setEntry({
          ...entry,
          title,
          description,
          date,
          priority,
          tags,
        })

        showNotification("Задача успешно обновлена", "success")
      }

      // Обновляем время последнего сохранения
      setLastSaved(new Date())

      // Сбрасываем флаг изменений
      setIsEdited(false)
    } catch (error) {
      console.error("Error updating task:", error)
      setError("Произошла ошибка при обновлении задачи")
      showNotification("Произошла ошибка при обновлении задачи", "error")
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
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background/80 backdrop-blur-sm border-b">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (source === "notes") {
                  router.push("/notes")
                } else if (source === "tasks") {
                  router.push("/tasks")
                } else {
                  router.push("/dashboard")
                }
              }}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <Badge variant="outline" className={cn("ml-2", typeColors[entry.type])}>
              <Icon className="h-3 w-3 mr-1" />
              {typeLabels[entry.type]}
            </Badge>

            {lastSaved && (
              <span className="text-xs text-muted-foreground ml-2">
                Сохранено {format(lastSaved, "HH:mm", { locale: ru })}
              </span>
            )}

            {isSaving && (
              <div className="flex items-center text-xs text-muted-foreground ml-2">
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Сохранение...
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isEdited && (
              <Button variant="default" size="sm" className="gap-1 text-sm" onClick={handleSave} disabled={isSaving}>
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
            )}

            {entry.type === "task" && (
              <Button
                variant={isCompleted ? "default" : "outline"}
                size="sm"
                className="gap-1 text-sm"
                onClick={toggleComplete}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Выполнено
                  </>
                ) : (
                  <>
                    <Circle className="h-4 w-4" />
                    Выполнить
                  </>
                )}
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Удалить
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
                  {date ? format(date, "d MMMM yyyy", { locale: ru }) : "Выберите дату"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-4">
                  <div className="grid gap-2">
                    <div className="grid gap-1">
                      <label className="text-sm font-medium">Дата</label>
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
                  {date ? format(date, "HH:mm", { locale: ru }) : "00:00"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-4">
                  <div className="grid gap-2">
                    <div className="grid gap-1">
                      <label className="text-sm font-medium">Время</label>
                      <Input
                        type="time"
                        value={date ? format(date, "HH:mm") : ""}
                        onChange={(e) => {
                          if (!date) return
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
            {entry.type === "task" && (
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
            )}
          </div>

          {/* Редактор содержимого */}
          <div className="pt-4 border-t">
            {entry.type === "note" ? (
              <RichTextEditor
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Добавьте описание..."
                className="border-none shadow-none"
                minHeight="300px"
              />
            ) : (
              <RichTextEditor
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Добавьте описание..."
                className="border-none shadow-none"
                minHeight="200px"
              />
            )}
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Запись будет навсегда удалена из вашей учетной записи.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
