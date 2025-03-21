"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, ListTodo, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { entries } from "@/data/entries"
import { format } from "date-fns"
import type { Entry, PriorityLevel } from "@/types/entry"

// Импортируем хук для уведомлений
import { useNotification } from "@/components/ui/notification"

export default function EditTaskPage() {
  const router = useRouter()
  const params = useParams()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<PriorityLevel>("medium")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [tags, setTags] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [entry, setEntry] = useState<Entry | null>(null)

  // Добавляем использование хука в компоненте
  const { showNotification } = useNotification()

  useEffect(() => {
    const fetchEntry = async () => {
      setIsLoading(true)

      // Ищем задачу только в базе данных
      try {
        const response = await fetch(`/api/tasks/${params.id}`)
        const data = await response.json()

        if (data.success && data.task) {
          const task = data.task
          setEntry(task)
          setTitle(task.title)
          setDescription(task.description)

          // Проверяем, что приоритет является допустимым значением
          const taskPriority = task.priority || "medium"
          if (taskPriority === "low" || taskPriority === "medium" || taskPriority === "high") {
            setPriority(taskPriority as PriorityLevel)
          } else {
            setPriority("medium")
          }

          // Форматируем дату и время
          const taskDate = new Date(task.date)
          setDate(format(taskDate, "yyyy-MM-dd"))
          setTime(format(taskDate, "HH:mm"))

          // Объединяем теги в строку
          setTags(task.tags?.join(", ") || "")
        } else {
          // Если не нашли, перенаправляем на дашборд
          router.push("/dashboard")
        }
      } catch (error) {
        console.error("Error fetching task:", error)
        setError("Ошибка при загрузке задачи")
        router.push("/dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEntry()
  }, [params.id, router])

  // Функция для безопасного обновления приоритета
  const handlePriorityChange = (value: string) => {
    // Проверяем, что значение является допустимым PriorityLevel
    if (value === "low" || value === "medium" || value === "high") {
      setPriority(value as PriorityLevel)
    } else {
      console.warn(`Недопустимое значение приоритета: ${value}`)
      setPriority("medium") // Устанавливаем значение по умолчанию
    }
  }

  // Обновляем функцию handleSubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      // Формируем дату и время
      const taskDate = new Date(`${date}T${time}:00`)

      // Преобразуем теги из строки в массив
      const tagArray = tags
        ? tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
        : []

      // Если это задача из базы данных
      if (entry && !entries.find((e) => e.id === entry.id)) {
        // Отправляем данные на сервер
        const response = await fetch(`/api/tasks/${params.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            description,
            date: taskDate.toISOString(),
            priority,
            tags: tagArray,
          }),
        })

        const data = await response.json()

        if (!data.success) {
          setError(data.message || "Не удалось обновить задачу")
          showNotification(data.message || "Не удалось обновить задачу", "error")
          setIsSaving(false)
          return
        } else {
          showNotification("Задача успешно обновлена", "success")
        }
      } else {
        // Для статических записей просто имитируем сохранение
        await new Promise((resolve) => setTimeout(resolve, 1000))
        console.log({ id: params.id, title, description, priority, date, time, tags: tagArray })
        showNotification("Задача успешно обновлена", "success")
      }

      router.push("/dashboard")
    } catch (error) {
      console.error("Error updating task:", error)
      setError("Произошла ошибка при обновлении задачи")
      showNotification("Произошла ошибка при обновлении задачи", "error")
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Загрузка...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Mobile padding for header */}
      <div className="h-16 md:hidden" />

      <div className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 aspect-square">
              <ListTodo className="h-4 w-4 text-blue-500" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Редактирование задачи</h1>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 rounded-md">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <Card className="border-none shadow-md overflow-hidden">
            <div className="h-1 bg-blue-500" />
            <CardHeader>
              <div className="space-y-2">
                <Label htmlFor="title">Заголовок</Label>
                <Input
                  id="title"
                  placeholder="Введите заголовок задачи"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  placeholder="Введите описание задачи..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Приоритет</Label>
                <Select value={priority} onValueChange={handlePriorityChange}>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Выберите приоритет" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Низкий</SelectItem>
                    <SelectItem value="medium">Средний</SelectItem>
                    <SelectItem value="high">Высокий</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Дата и время</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Теги (через запятую)</Label>
                <Input
                  id="tags"
                  placeholder="работа, срочно, проект"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Отмена
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Сохранение..." : "Сохранить изменения"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>

      {/* Mobile padding for bottom navigation */}
      <div className="h-20 md:hidden" />
    </div>
  )
}

