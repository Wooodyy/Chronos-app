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
import type { Entry, PriorityLevel } from "@/types/entry"
import { useNotification } from "@/components/ui/notification"

export default function TaskPage() {
  const router = useRouter()
  const params = useParams()
  const [task, setTask] = useState<Entry | null>(null)
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

  const searchParams = useParams()
  const [source, setSource] = useState("dashboard")

  useEffect(() => {
    // Get the source from URL query parameters
    const urlParams = new URLSearchParams(window.location.search)
    const sourceParam = urlParams.get("source")
    if (sourceParam) {
      setSource(sourceParam)
    }
  }, [])

  useEffect(() => {
    const fetchTask = async () => {
      setIsLoading(true)

      try {
        const response = await fetch(`/api/tasks/${params.id}`)
        const data = await response.json()

        if (data.success && data.task) {
          setTask(data.task)
          setIsCompleted(data.task.completed || false)
          initializeFormFields(data.task)
        } else {
          // Если не нашли задачу, перенаправляем на список задач
          router.push("/tasks")
        }
      } catch (error) {
        console.error("Error fetching task:", error)
        router.push("/tasks")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTask()
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

  if (!task) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Calendar className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold">Задача не найдена</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Задача, которую вы ищете, не существует или была удалена.
        </p>
        <Button onClick={() => router.push("/tasks")} className="mt-4">
          Вернуться к задачам
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
    low: "Низкий",
    medium: "Средний",
    high: "Высокий",
  }

  // Обновляем функцию handleDelete
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        showNotification("Задача успешно удалена", "success")
        router.push(source === "tasks" ? "/tasks" : "/dashboard")
      } else {
        showNotification("Не удалось удалить задачу", "error")
      }
    } catch (error) {
      console.error("Error deleting task:", error)
      showNotification("Ошибка при удалении задачи", "error")
    }
  }

  // Обновляем функцию toggleComplete
  const toggleComplete = async () => {
    try {
      const response = await fetch(`/api/tasks/${task.id}/complete`, {
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
  }

  // Функция для сохранения изменений
  const handleSave = async () => {
    if (!task || !date) return

    setIsSaving(true)
    setError(null)

    try {
      // Отправляем данные на сервер
      const response = await fetch(`/api/tasks/${task.id}`, {
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
        setTask({
          ...task,
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

      <div className="flex-1 max-w-4xl mx-auto w-full">
        {/* Верхняя панель */}
        <div className="sticky top-0 z-30 flex items-center justify-between p-4 bg-background/95 backdrop-blur-md border-b shadow-sm">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(source === "tasks" ? "/tasks" : "/dashboard")}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <Badge
              variant="outline"
              className="ml-2 h-9 px-4 bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center"
            >
              <ListTodo className="h-4 w-4 mr-2" />
              Задача
            </Badge>

            {lastSaved && (
              <span className="text-xs text-muted-foreground ml-2 hidden md:inline">
                Сохранено {format(lastSaved, "HH:mm", { locale: ru })}
              </span>
            )}

            {isSaving && (
              <div className="flex items-center text-xs text-muted-foreground ml-2 hidden md:flex">
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Сохранение...
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
            {/* Статус выполнения - перемещен сюда из верхней панели */}
            <Button
              variant={isCompleted ? "default" : "outline"}
              size="sm"
              className="gap-2 h-8"
              onClick={toggleComplete}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Выполнено
                </>
              ) : (
                <>
                  <Circle className="h-3.5 w-3.5" />
                  Выполнить
                </>
              )}
            </Button>

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

          {/* Описание - используем обычный Textarea для задач */}
          <div className="pt-4 border-t">
            <Textarea
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Добавьте описание..."
              className="min-h-[200px] resize-none border-none shadow-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-base"
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Задача будет навсегда удалена из вашей учетной записи.
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
