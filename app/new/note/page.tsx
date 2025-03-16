"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function NewNotePage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // Имитация сохранения
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // В реальном приложении здесь был бы API-запрос
    console.log({ title, content })

    router.push("/dashboard")
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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Новая заметка</h1>
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
                {isSaving ? "Сохранение..." : "Сохранить"}
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

