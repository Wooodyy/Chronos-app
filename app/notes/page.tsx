"use client"

import { useState, useEffect, useRef } from "react"
import { FileText, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EntriesList } from "@/components/features/entries/entries-list"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useNotification } from "@/components/ui/notification"
import type { Entry } from "@/types/entry"

export default function NotesPage() {
  const router = useRouter()
  const { user, refreshData } = useAuth()
  const { showNotification } = useNotification()
  const [notes, setNotes] = useState<Entry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const dataFetchedRef = useRef(false)
  const userDataRefreshedRef = useRef(false)

  // Загружаем заметки из базы данных
  useEffect(() => {
    // Функция для загрузки заметок
    const fetchNotes = async () => {
      if (!user?.login) return

      // Сбрасываем флаг при изменении пользователя
      if (dataFetchedRef.current && user.login) {
        dataFetchedRef.current = false
      }

      if (dataFetchedRef.current) return

      setIsLoading(true)
      try {
        const timestamp = new Date().getTime()
        const response = await fetch(`/api/notes/user/${user.login}?t=${timestamp}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        })

        const data = await response.json()

        if (data.success && data.notes) {
          setNotes(data.notes)
        }
      } catch (error) {
        console.error("Error fetching user notes:", error)
        showNotification("Не удалось загрузить заметки", "error")
      } finally {
        setIsLoading(false)
        dataFetchedRef.current = true
      }
    }

    fetchNotes()
  }, [user?.login, showNotification])

  // Обновляем данные пользователя при первом рендере страницы
  useEffect(() => {
    if (user && !userDataRefreshedRef.current) {
      userDataRefreshedRef.current = true

      // Используем setTimeout, чтобы избежать циклических обновлений
      const timer = setTimeout(() => {
        refreshData()
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [user, refreshData])

  if (!user) {
    router.push("/login")
    return null
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Mobile padding for header */}
      <div className="h-16 md:hidden" />

      <div className="flex-1 p-4 md:p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 aspect-square">
              <FileText className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Заметки</h1>
              <p className="text-sm text-muted-foreground mt-1">Управляйте своими заметками</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => router.push("/new/note")} className="gap-2 hidden md:flex">
              <Plus className="h-4 w-4" />
              Создать заметку
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <EntriesList entries={notes} showDate={true} />
        )}
      </div>

      {/* Mobile padding for bottom navigation */}
      <div className="h-20 md:hidden" />
    </div>
  )
}

