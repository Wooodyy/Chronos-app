"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Tag, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"

// Заглушка для данных заметки
const mockNote = {
  id: "1",
  title: "Идеи для проекта",
  content:
    "1. Добавить темную тему\n2. Улучшить мобильную версию\n3. Добавить экспорт в PDF\n4. Интеграция с календарем",
  tags: ["Проект", "Идеи", "Разработка"],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export default function NotePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const titleRef = useRef<HTMLInputElement>(null)

  const [note, setNote] = useState(mockNote)
  const [originalNote, setOriginalNote] = useState(mockNote)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [hasChanges, setHasChanges] = useState(false)

  // Загрузка данных заметки
  useEffect(() => {
    // В реальном приложении здесь был бы API-запрос для получения данных заметки
    // const fetchNote = async () => {
    //   const response = await fetch(`/api/notes/${params.id}`)
    //   const data = await response.json()
    //   setNote(data)
    //   setOriginalNote(data)
    // }
    // fetchNote()

    // Фокус на заголовке при загрузке
    if (titleRef.current) {
      titleRef.current.focus()
    }
  }, [params.id])

  // Проверка наличия изменений
  useEffect(() => {
    const noteChanged =
      note.title !== originalNote.title ||
      note.content !== originalNote.content ||
      JSON.stringify(note.tags) !== JSON.stringify(originalNote.tags)

    setHasChanges(noteChanged)
  }, [note, originalNote])

  const handleSave = async () => {
    if (!note.title.trim()) {
      toast({
        title: "Ошибка",
        description: "Заголовок заметки не может быть пустым",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      // В реальном приложении здесь был бы API-запрос для сохранения заметки
      // await fetch(`/api/notes/${params.id}`, {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(note),
      // })

      // Имитация задержки сохранения
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setOriginalNote(note)
      setHasChanges(false)

      toast({
        title: "Заметка сохранена",
        description: "Ваша заметка успешно сохранена",
      })
    } catch (error) {
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить заметку. Попробуйте еще раз.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      // В реальном приложении здесь был бы API-запрос для удаления заметки
      // await fetch(`/api/notes/${params.id}`, {
      //   method: "DELETE",
      // })

      // Имитация задержки удаления
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Заметка удалена",
        description: "Ваша заметка успешно удалена",
      })

      router.push("/notes")
    } catch (error) {
      toast({
        title: "Ошибка удаления",
        description: "Не удалось удалить заметку. Попробуйте еще раз.",
        variant: "destructive",
      })
    }
  }

  const addTag = () => {
    if (!newTag.trim()) return
    if (note.tags.includes(newTag.trim())) {
      toast({
        title: "Тег уже существует",
        description: "Этот тег уже добавлен к заметке",
      })
      return
    }

    setNote({
      ...note,
      tags: [...note.tags, newTag.trim()],
    })
    setNewTag("")
  }

  const removeTag = (tagToRemove: string) => {
    setNote({
      ...note,
      tags: note.tags.filter((tag) => tag !== tagToRemove),
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Плавающая верхняя панель */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/notes")} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="text-sm text-muted-foreground">
              {new Date(note.updatedAt).toLocaleDateString()} • Заметка
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasChanges && (
              <Button onClick={handleSave} disabled={isSaving} className="gap-1">
                <Save className="h-4 w-4" />
                {isSaving ? "Сохранение..." : "Сохранить"}
              </Button>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-5 w-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Удалить заметку?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Это действие нельзя отменить. Заметка будет удалена навсегда.
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
        </div>
      </div>

      {/* Основное содержимое */}
      <div className="container flex-1 px-4 py-6 max-w-4xl mx-auto">
        <div className="space-y-6">
          {/* Заголовок */}
          <Input
            ref={titleRef}
            value={note.title}
            onChange={(e) => setNote({ ...note, title: e.target.value })}
            placeholder="Заголовок заметки"
            className="text-3xl font-bold border-none px-0 h-auto focus-visible:ring-0"
          />

          {/* Теги */}
          <div className="flex flex-wrap items-center gap-2">
            {note.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="flex items-center gap-1 px-3 py-1">
                {tag}
                <button onClick={() => removeTag(tag)} className="ml-1 rounded-full hover:bg-muted p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}

            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Добавить тег..."
                className="border-none w-32 h-8 focus-visible:ring-0 p-0"
              />
              <Button variant="ghost" size="sm" onClick={addTag} disabled={!newTag.trim()} className="h-8 px-2">
                Добавить
              </Button>
            </div>
          </div>

          <Separator />

          {/* Содержимое */}
          <Textarea
            value={note.content}
            onChange={(e) => setNote({ ...note, content: e.target.value })}
            placeholder="Начните писать содержимое заметки..."
            className="min-h-[300px] border-none resize-none focus-visible:ring-0 text-base leading-relaxed"
          />
        </div>
      </div>

      {/* Мобильный отступ для нижней навигации */}
      <div className="h-20 md:hidden" />
    </div>
  )
}

