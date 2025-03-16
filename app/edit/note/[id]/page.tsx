"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { entries } from "@/data/entries"

export default function EditNotePage() {
  const router = useRouter()
  const params = useParams()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Находим заметку по ID
    const note = entries.find((entry) => entry.id === params.id && entry.type === "note")

    if (note) {
      setTitle(note.title)
      setContent(note.description)
    } else {
      // Если заметка не найдена, перенаправляем на дашборд
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
    console.log({ id: params.id, title, content })

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
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 aspect-square">
              <FileText className="h-4 w-4 text-emerald-500" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Редактирование заметки</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-none shadow-md overflow-hidden">
            <div className="h-1 bg-emerald-500" />
            <CardHeader>
              <div className="space-y-2">
                <Input
                  placeholder="Заголовок заметки"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-xl md:text-2xl font-bold border-none px-0 h-auto focus-visible:ring-0"
                  required
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="content">Содержание</Label>
                  <Textarea
                    id="content"
                    placeholder="Введите содержание заметки..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[200px]"
                    required
                  />
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

