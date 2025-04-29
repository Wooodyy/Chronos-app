"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { FileText, Plus, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EntryCard } from "@/components/features/entries/entry-card"
import { useAuth } from "@/contexts/auth-context"
import type { Entry } from "@/types/entry"
import { useNotification } from "@/components/ui/notification"
import { format, isToday, isTomorrow, isYesterday } from "date-fns"
import { ru } from "date-fns/locale"

export default function NotesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { showNotification } = useNotification()
  const [notes, setNotes] = useState<Entry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchNotes = async () => {
      if (!user?.login) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/notes/user/${user.login}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            // Преобразуем даты из строк в объекты Date
            const formattedNotes = data.notes.map((note: any) => ({
              ...note,
              date: new Date(note.date),
            }))
            setNotes(formattedNotes)
          } else {
            showNotification("Не удалось загрузить заметки", "error")
          }
        } else {
          showNotification("Ошибка при загрузке заметок", "error")
        }
      } catch (error) {
        console.error("Error fetching notes:", error)
        showNotification("Произошла ошибка при загрузке заметок", "error")
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotes()
  }, [user, showNotification])

  // Фильтрация заметок по поисковому запросу
  const filteredNotes = notes.filter((note) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      note.title.toLowerCase().includes(searchLower) ||
      (note.description && note.description.toLowerCase().includes(searchLower)) ||
      (note.tags && note.tags.some((tag) => tag.toLowerCase().includes(searchLower)))
    )
  })

  // Группировка заметок по дням
  const groupedNotes = useMemo(() => {
    // Сортируем заметки по дате (от новых к старым)
    const sortedNotes = [...filteredNotes].sort((a, b) => b.date.getTime() - a.date.getTime())

    // Группируем по дням
    const groups: { [key: string]: { title: string; notes: Entry[] } } = {}

    sortedNotes.forEach((note) => {
      let dateKey: string
      let dateTitle: string

      if (isToday(note.date)) {
        dateKey = "today"
        dateTitle = "Сегодня"
      } else if (isTomorrow(note.date)) {
        dateKey = "tomorrow"
        dateTitle = "Завтра"
      } else if (isYesterday(note.date)) {
        dateKey = "yesterday"
        dateTitle = "Вчера"
      } else {
        dateKey = format(note.date, "yyyy-MM-dd")
        dateTitle = format(note.date, "d MMMM yyyy", { locale: ru })
      }

      if (!groups[dateKey]) {
        groups[dateKey] = {
          title: dateTitle,
          notes: [],
        }
      }

      groups[dateKey].notes.push(note)
    })

    // Преобразуем объект в массив для удобства отображения
    return Object.entries(groups).map(([key, value]) => ({
      key,
      title: value.title,
      notes: value.notes,
    }))
  }, [filteredNotes])

  const handleCreateNote = () => {
    router.push("/new/note")
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Mobile padding for header */}
      <div className="h-16 md:hidden" />

      <div className="flex-1 p-4 md:p-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
              <FileText className="h-5 w-5 text-emerald-500" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Заметки</h1>
          </div>

          {/* Кнопка "Новая заметка" скрыта на мобильных устройствах и имеет зеленый цвет со свечением */}
          <Button
            onClick={handleCreateNote}
            className="gap-2 hidden md:flex bg-emerald-600 hover:bg-emerald-700"
            style={{
              boxShadow: "0 0 15px rgba(16, 185, 129, 0.5)",
            }}
          >
            <Plus className="h-4 w-4" />
            Новая заметка
          </Button>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск заметок..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : groupedNotes.length > 0 ? (
          <div className="space-y-8">
            {groupedNotes.map((group) => (
              <div key={group.key}>
                <h2 className="text-xl font-semibold mb-4 px-1">{group.title}</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {group.notes.map((note, index) => (
                    <EntryCard key={note.id} entry={note} index={index} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
              <FileText className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Нет заметок</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              {searchQuery
                ? "Не найдено заметок, соответствующих вашему запросу"
                : "У вас пока нет заметок. Создайте новую заметку, чтобы сохранить важную информацию."}
            </p>
            <Button
              onClick={handleCreateNote}
              className="bg-emerald-600 hover:bg-emerald-700"
              style={{
                boxShadow: "0 0 15px rgba(16, 185, 129, 0.5)",
              }}
            >
              Создать заметку
            </Button>
          </div>
        )}
      </div>

      {/* Mobile padding for bottom navigation */}
      <div className="h-20 md:hidden" />
    </div>
  )
}
