"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Save, Tag, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useNotification } from "@/components/ui/notification"
import { RichTextEditor } from "@/components/features/editor/rich-text-editor"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"

export default function NewNotePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { showNotification } = useNotification()
  const { t } = useLanguage()

  // Функция для форматирования даты с использованием локализации
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

  // Refs для элементов редактирования
  const titleRef = useRef<HTMLInputElement>(null)

  // Состояния для полей формы
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("<p></p>")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Проверяем авторизацию
  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  // Фокус на заголовке при загрузке
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.focus()
    }
  }, [])

  // Обработчики изменений полей
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }

  const handleContentChange = (html: string) => {
    setContent(html)
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

  // Функция для сохранения заметки
  const handleSave = async () => {
    if (!title.trim()) {
      showNotification(t("note.titleRequired"), "error")
      return
    }

    if (!user) {
      showNotification(t("note.authRequired"), "error")
      router.push("/login")
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login: user.login,
          title,
          content,
          tags,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Ошибка при создании заметки")
      }

      showNotification(t("note.createSuccess"), "success")
      router.push("/notes")
    } catch (error) {
      console.error("Error creating note:", error)
      showNotification(error instanceof Error ? error.message : t("note.createErrorGeneral"), "error")
    } finally {
      setIsSaving(false)
    }
  }

  const typeColors = {
    note: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
  }

  if (!user) {
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
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <Badge
              variant="outline"
              className="ml-2 h-9 px-4 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center"
            >
              <Calendar className="h-4 w-4 mr-2" />
              {t("note.note")}
            </Badge>

            <span className="text-xs text-muted-foreground ml-2 hidden md:inline">
              {formatLocalizedDate(new Date())}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              className="h-9 md:h-9 px-4 gap-1 bg-purple-600 hover:bg-purple-700 text-white font-medium"
              onClick={handleSave}
              disabled={isSaving || !title.trim()}
              style={{
                boxShadow: "0 0 15px rgba(147, 51, 234, 0.5)",
              }}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("note.creating")}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {t("note.create")}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Основное содержимое */}
        <div className="p-4 md:p-8 space-y-8">
          {/* Заголовок */}
          <div className="space-y-2">
            <Input
              ref={titleRef}
              value={title}
              onChange={handleTitleChange}
              className="text-3xl md:text-4xl font-bold tracking-tight border-none shadow-none p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
              placeholder={t("note.titlePlaceholder")}
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
                placeholder={t("note.newTagPlaceholder")}
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

          {/* Редактор содержимого */}
          <div className="pt-4">
            <RichTextEditor
              value={content}
              onChange={handleContentChange}
              placeholder={t("note.contentPlaceholder")}
              className="border-none shadow-none"
              minHeight="300px"
            />
          </div>
        </div>
      </div>

      {/* Mobile padding for bottom navigation */}
      <div className="h-20 md:hidden" />
    </div>
  )
}
