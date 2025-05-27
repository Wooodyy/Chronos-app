"use client"

import type React from "react"

import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { ru, kk, enUS } from "date-fns/locale"
import { ArrowLeft, FileText, Trash2, Loader2, Tag, MoreHorizontal, Plus, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"

export default function NotePage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const { t, language } = useLanguage()
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
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  // Состояние для отслеживания изменений
  const [isEdited, setIsEdited] = useState(false)

  // Refs для элементов редактирования
  const titleRef = useRef<HTMLInputElement>(null)

  // Добавляем использование хука в компоненте
  const { showNotification } = useNotification()

  // Функция для получения локали даты
  const getDateLocale = () => {
    switch (language) {
      case "kz":
        return kk
      case "en":
        return enUS
      default:
        return ru
    }
  }

  // Проверяем авторизацию
  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  useEffect(() => {
    const fetchNote = async () => {
      if (!user) return

      setIsLoading(true)

      try {
        const response = await fetch(`/api/notes/${params.id}`)

        if (!response.ok) {
          if (response.status === 404) {
            router.push("/notes")
            return
          }
          throw new Error(t("note.loadError"))
        }

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.message || t("note.notFound"))
        }

        setNote(data.note)
        initializeFormFields(data.note)
      } catch (error) {
        console.error("Ошибка при загрузке заметки:", error)
        showNotification(t("note.loadError"), "error")
        router.push("/notes")
      } finally {
        setIsLoading(false)
      }
    }

    fetchNote()

    // Get the source from URL query parameters
    const urlParams = new URLSearchParams(window.location.search)
    const sourceParam = urlParams.get("source")
    if (sourceParam) {
      setSource(sourceParam)
    }
  }, [params.id, router, user, showNotification, t])

  // Функция для инициализации полей формы
  const initializeFormFields = (note: Entry) => {
    setTitle(note.title)
    setContent(note.description || "")
    setTags(note.tags || [])
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

  // Функция для удаления заметки
  const handleDelete = async () => {
    if (!note) return

    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || t("note.deleteError"))
      }

      showNotification(t("note.deleteSuccess"), "success")
      router.push(source === "notes" ? "/notes" : "/dashboard")
    } catch (error) {
      console.error("Error deleting note:", error)
      showNotification(t("note.deleteError"), "error")
    }
  }

  // Функция для сохранения изменений
  const handleSave = async () => {
    if (!note) return

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          tags,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || t("note.updateError"))
      }

      // Обновляем локальное состояние
      setNote({
        ...note,
        title,
        description: content,
        tags,
      })

      showNotification(t("note.updateSuccess"), "success")
      setLastSaved(new Date())
      setIsEdited(false)
    } catch (error) {
      console.error("Error updating note:", error)
      setError(error instanceof Error ? error.message : t("note.updateError"))
      showNotification(t("note.updateError"), "error")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">{t("note.loading")}</p>
      </div>
    )
  }

  if (!note || !user) {
    return null
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
              onClick={() => router.push(source === "notes" ? "/notes" : "/dashboard")}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <Badge
              variant="outline"
              className="ml-2 h-9 px-4 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center"
            >
              <FileText className="h-4 w-4 mr-2" />
              {t("note.note")}
            </Badge>

            {lastSaved && (
              <span className="text-xs text-muted-foreground ml-2 hidden md:inline">
                {t("note.saved", { time: format(lastSaved, "HH:mm", { locale: getDateLocale() }) })}
              </span>
            )}

            {isSaving && (
              <div className="flex items-center text-xs text-muted-foreground ml-2 hidden md:flex">
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                {t("note.saving")}
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
                    {t("note.saving")}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {t("note.save")}
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
                  {t("note.delete")}
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
              placeholder={t("note.noTitle")}
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
                placeholder={t("note.newTag")}
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
              placeholder={t("note.addContent")}
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
            <AlertDialogTitle>{t("note.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("note.deleteConfirmDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("note.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {t("note.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
