"use client"

import { useState, useEffect, useRef } from "react"
import { CalendarView } from "@/components/features/calendar/calendar-view"
import { EntriesList } from "@/components/features/entries/entries-list"
import { AddEntryButton } from "@/components/features/entries/add-entry-button"
import { SearchButton } from "@/components/shared/search-button"
import { entries as staticEntries } from "@/data/entries"
import { isSameDay } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ListCollapse, ListTodo, Bell, BookMarked, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import type { Entry } from "@/types/entry"

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState("")
  const [isCompact, setIsCompact] = useState(false)
  const [dbTasks, setDbTasks] = useState<Entry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const dataFetchedRef = useRef(false)

  // Эффект для обработки изменения размера экрана
  useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth < 500)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Эффект для загрузки задач пользователя
  useEffect(() => {
    // Функция для загрузки задач
    const fetchTasks = async () => {
      if (!user?.login) return

      // Сбрасываем флаг при изменении пользователя
      if (dataFetchedRef.current && user.login) {
        dataFetchedRef.current = false
      }

      if (dataFetchedRef.current) return

      setIsLoading(true)
      try {
        const timestamp = new Date().getTime()
        const response = await fetch(`/api/tasks/user/${user.login}?t=${timestamp}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        })

        const data = await response.json()

        if (data.success && data.tasks) {
          setDbTasks(data.tasks)
        }
      } catch (error) {
        console.error("Error fetching user tasks:", error)
      } finally {
        setIsLoading(false)
        dataFetchedRef.current = true
      }
    }

    fetchTasks()
  }, [user?.login])

  // Получаем напоминания и заметки из статических данных
  const staticRemindersAndNotes = staticEntries.filter((entry) => entry.type === "reminder" || entry.type === "note")

  // Объединяем все записи
  const allEntries = [...staticRemindersAndNotes, ...dbTasks]

  // Фильтруем записи по выбранной дате и поисковому запросу
  const dayEntries = allEntries
    .filter((entry) => isSameDay(entry.date, selectedDate))
    .filter(
      (entry) =>
        searchQuery === "" ||
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )

  const tasks = dayEntries.filter((entry) => entry.type === "task")
  const reminders = dayEntries.filter((entry) => entry.type === "reminder")
  const notes = dayEntries.filter((entry) => entry.type === "note")

  return (
    <div className="flex flex-col min-h-full">
      <div className="h-16 md:hidden" />

      <div className="flex-1 p-4 md:p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Панель управления</h1>
            <p className="text-muted-foreground mt-1">Добро пожаловать, {user?.name || "Пользователь"}</p>
          </div>
          <div className="flex items-center gap-4">
            <SearchButton onSearch={setSearchQuery} />
            <AddEntryButton />
          </div>
        </div>

        <Card className="overflow-hidden border-none shadow-md">
          <CardContent className="p-0">
            <CalendarView selectedDate={selectedDate} onDateSelect={setSelectedDate} dbTasks={dbTasks} />
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full max-w-lg mx-auto flex flex-wrap gap-2 mb-6">
              <TabsTrigger value="all" className="flex-auto min-w-fit">
                <span className="flex items-center gap-2">
                  <ListCollapse className="h-4 w-4" />
                  {!isCompact && <span>Все</span>}
                </span>
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex-auto min-w-fit">
                <span className="flex items-center gap-2">
                  <ListTodo className="h-4 w-4" />
                  {!isCompact && <span>Задачи</span>}
                </span>
              </TabsTrigger>
              <TabsTrigger value="reminders" className="flex-auto min-w-fit">
                <span className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  {!isCompact && <span>Напоминания</span>}
                </span>
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex-auto min-w-fit">
                <span className="flex items-center gap-2">
                  <BookMarked className="h-4 w-4" />
                  {!isCompact && <span>Заметки</span>}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <EntriesList
                entries={dayEntries}
                title={`Записи на ${selectedDate.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}`}
              />
            </TabsContent>

            <TabsContent value="tasks" className="mt-0">
              <EntriesList entries={tasks} title="Задачи" />
            </TabsContent>

            <TabsContent value="reminders" className="mt-0">
              <EntriesList entries={reminders} title="Напоминания" />
            </TabsContent>

            <TabsContent value="notes" className="mt-0">
              <EntriesList entries={notes} title="Заметки" />
            </TabsContent>
          </Tabs>
        )}
      </div>

      <div className="h-20 md:hidden" />
    </div>
  )
}

