"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { entries } from "@/data/entries"
import { format } from "date-fns"

export default function EditReminderPage() {
  const router = useRouter()
  const params = useParams()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("medium")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Находим напоминание по ID
    const reminder = entries.find((entry) => entry.id === params.id && entry.type === "reminder")

    if (reminder) {
      setTitle(reminder.title)
      setDescription(reminder.description)
      setPriority(reminder.priority || "medium")

      // Форматируем дату и время
      const reminderDate = new Date(reminder.date)
      setDate(format(reminderDate, "yyyy-MM-dd"))
      setTime(format(reminderDate, "HH:mm"))
    } else {
      // Если напоминание не найдено, перенаправляем на дашборд
      router.push("/dashboard")
    }

    setIsLoading(false)
  }, [params.id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // Имитация сохранения
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // В реальном приложении здесь был бы API-запрос на обновление
    console.log({ id: params.id, title, description, priority, date, time })

    router.push("/dashboard")
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-full items-center justify-center">
        <p>Загрузка...</p>
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
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 aspect-square">
              <Bell className="h-4 w-4 text-amber-500" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Редактирование напоминания</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-none shadow-md overflow-hidden">
            <div className="h-1 bg-amber-500" />
            <CardHeader>
              <div className="space-y-2">
                <Label htmlFor="title">Заголовок</Label>
                <Input
                  id="title"
                  placeholder="Введите заголовок напоминания"
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
                  placeholder="Введите описание напоминания..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Приоритет</Label>
                <Select value={priority} onValueChange={setPriority}>
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

