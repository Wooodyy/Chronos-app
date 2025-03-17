"use client"

import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { ArrowLeft, Calendar, Clock, CheckCircle2, Circle, Edit, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { entries } from "@/data/entries"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
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
import type { Entry } from "@/types/entry"

export default function EntryPage() {
  const router = useRouter()
  const params = useParams()
  const [entry, setEntry] = useState<Entry | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEntry = async () => {
      setIsLoading(true)

      // Сначала ищем в статическом массиве напоминания и заметки
      const staticEntry = entries.find((e) => e.id === params.id && (e.type === "reminder" || e.type === "note"))

      if (staticEntry) {
        setEntry(staticEntry)
        setIsCompleted(staticEntry.completed || false)
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
          Запись, которую вы ищете, не существует или была удалена.
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
    task: CheckCircle2,
    reminder: Clock,
    note: Calendar,
  }

  const Icon = typeIcons[entry.type]

  const handleDelete = async () => {
    // Если это задача из базы данных
    if (entry.type === "task" && !entries.find((e) => e.id === entry.id)) {
      try {
        const response = await fetch(`/api/tasks/${entry.id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          router.push("/dashboard")
        } else {
          console.error("Failed to delete task")
        }
      } catch (error) {
        console.error("Error deleting task:", error)
      }
    } else {
      // Для статических записей просто перенаправляем
      console.log("Deleting entry:", entry.id)
      router.push("/dashboard")
    }
  }

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
        } else {
          console.error("Failed to update task completion status")
        }
      } catch (error) {
        console.error("Error updating task:", error)
      }
    } else {
      // Для статических записей просто меняем состояние
      setIsCompleted(!isCompleted)
    }
  }

  const handleEdit = () => {
    // Перенаправляем на страницу редактирования в зависимости от типа записи
    router.push(`/edit/${entry.type}/${entry.id}`)
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
          <div>
            <Badge variant="outline" className={cn("mb-2", typeColors[entry.type])}>
              <Icon className="h-3 w-3 mr-1" />
              {typeLabels[entry.type]}
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{entry.title}</h1>
          </div>
        </div>

        <Card className="border-none shadow-md overflow-hidden mb-6">
          <div
            className={cn(
              "h-1",
              entry.type === "task" ? "bg-blue-500" : entry.type === "reminder" ? "bg-amber-500" : "bg-emerald-500",
            )}
          />
          <CardHeader>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {format(entry.date, "d MMMM yyyy", { locale: ru })}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {format(entry.date, "HH:mm", { locale: ru })}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert">
              <p>{entry.description}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {entry.priority && (
                <Badge
                  variant="outline"
                  className={cn(
                    entry.priority === "low"
                      ? "text-success"
                      : entry.priority === "medium"
                        ? "text-warning"
                        : "text-destructive",
                  )}
                >
                  Приоритет: {entry.priority === "low" ? "Низкий" : entry.priority === "medium" ? "Средний" : "Высокий"}
                </Badge>
              )}

              {entry.tags &&
                entry.tags.length > 0 &&
                entry.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-secondary/50">
                    {tag}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-4 justify-between">
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={handleEdit}>
              <Edit className="h-4 w-4" />
              Редактировать
            </Button>
            <Button variant="destructive" className="gap-2" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4" />
              Удалить
            </Button>
          </div>

          {entry.type === "task" && (
            <Button variant={isCompleted ? "default" : "outline"} className="gap-2" onClick={toggleComplete}>
              {isCompleted ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Выполнено
                </>
              ) : (
                <>
                  <Circle className="h-4 w-4" />
                  Отметить как выполненное
                </>
              )}
            </Button>
          )}
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

