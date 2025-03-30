"use client"

import type React from "react"

import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { ArrowLeft, FileText, Trash2, Loader2, Tag, MoreHorizontal, Plus, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { entries } from "@/data/entries"
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
import type { Entry } from "@/types/entry"
import { RichTextEditor } from "@/components/features/editor/rich-text-editor"
import { useNotification } from "@/components/ui/notification"

export default function NotePage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useParams()
  const [source, setSource] = useState("dashboard")
  const [note, setNote] = useState<Entry | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Состояния для редактируемых полей
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
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
    const fetchNote = async () => {
      setIsLoading(true)

      // Ищем заметку в статическом массиве
      const staticNote = entries.find((e) => e.id === params.id && e.type === "note")

      if (staticNote) {
        setNote(staticNote)
        initializeFormFields(staticNote)
        setIsLoading(false)
        return
      }

      // Если не нашли в статическом массиве, можно добавить запрос к API
      // для получения заметки из базы данных (если это будет реализовано)

      // Если не нашли заметку, перенаправляем на список заметок
      router.push("/notes")
      setIsLoading(false)
    }

    fetchNote()

    // Get the source from URL query parameters
    const urlParams = new URLSearchParams(window.location.search)
    const sourceParam = urlParams.get("source")
    if (sourceParam) {
      setSource(sourceParam)
    }
  }, [params.id, router])

  // Функция для инициализации полей формы
  const initializeFormFields = (note: Entry) => {
    setTitle(note.title)
    setContent(note.description || "")

    // Устанавливаем дату
    setDate(new Date(note.date))

    // Устанавливаем теги
    setTags(note.tags || [])

    // Сбрасываем флаг изменений
    setIsEdited(false)
  }

  // Обработчики изменений полей
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    setIsEdited(true)
  }

  const handleContentChange = (html: string) => {
    setContent(html)
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

  if (!note) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <FileText className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold">Заметка не найдена</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Заметка, которую вы ищете, не существует или была удалена.
        </p>
        <Button onClick={() => router.push("/notes")} className="mt-4">
          Вернуться к заметкам
        </Button>
      </div>
    )
  }

  // Обновляем функцию handleDelete
  const handleDelete = async () => {
    // For static notes just redirect
    console.log("Deleting note:", note.id)
    showNotification("Заметка успешно удалена", "success")
    router.push(source === "notes" ? "/notes" : "/dashboard")
  }

  // Функция для сохранения изменений
  const handleSave = async () => {
    if (!note || !date) return

    setIsSaving(true)
    setError(null)

    try {
      // Для статических заметок просто имитируем сохранение
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Обновляем локальное состояние
      setNote({
        ...note,
        title,
        description: content,
        date,
        tags,
      })

      showNotification("Заметка успешно обновлена", "success")

      // Обновляем время последнего сохранения
      setLastSaved(new Date())

      // Сбрасываем флаг изменений
      setIsEdited(false)
    } catch (error) {
      console.error("Error updating note:", error)
      setError("Произошла ошибка при обновлении заметки")
      showNotification("Произошла ошибка при обновлении заметки", "error")
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
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background/80 backdrop-blur-sm border-b">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(source === "notes" ? "/notes" : "/dashboard")}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <Badge
              variant="outline"
              className="ml-2 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
            >
              <FileText className="h-3 w-3 mr-1" />
              Заметка
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

          {/* Теги */}
          <div className="flex flex-wrap items-center gap-2">
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
              <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleNewTagKeyDown}
                className="h-7 px-2 w-32 text-sm border-none focus-visible:ring-0"
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

          {/* Редактор содержимого - используем RichTextEditor для заметок */}
          <div className="pt-4">
            <RichTextEditor
              value={content}
              onChange={handleContentChange}
              placeholder="Начните писать содержимое заметки..."
              className="border-none shadow-none"
              minHeight="300px"
            />
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
              Это действие нельзя отменить. Заметка будет навсегда удалена из вашей учетной записи.
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

