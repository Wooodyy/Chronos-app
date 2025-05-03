"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { Bell, Plus, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EntryCard } from "@/components/features/entries/entry-card"
import { useAuth } from "@/contexts/auth-context"
import type { Entry } from "@/types/entry"
import { useNotification } from "@/components/ui/notification"
import { format, isToday, isTomorrow, isYesterday } from "date-fns"
import { ru } from "date-fns/locale"

export default function RemindersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { showNotification } = useNotification()
  const [reminders, setReminders] = useState<Entry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [loadingError, setLoadingError] = useState(false)

  // Переместил объявление ref внутрь компонента
  const remindersLoadedRef = useRef(false)

  // Функция для загрузки напоминаний
  const fetchReminders = async () => {
    if (!user?.login) {
      setIsLoading(false)
      return
    }

    // Проверяем, были ли уже загружены напоминания в текущей сессии
    if (remindersLoadedRef.current) {
      console.log("Reminders already loaded in this session")
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setLoadingError(false)

      const response = await fetch(`/api/reminders/user/${user.login}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Преобразуем даты из строк в объекты Date
          const formattedReminders = data.reminders.map((reminder: any) => ({
            ...reminder,
            date: new Date(reminder.date),
            repeat_until: reminder.repeat_until ? new Date(reminder.repeat_until) : undefined,
          }))
          setReminders(formattedReminders)
        } else {
          setLoadingError(true)
          showNotification("Не удалось загрузить напоминания", "error")
        }
      } else {
        setLoadingError(true)
        showNotification("Ошибка при загрузке напоминаний", "error")
      }
    } catch (error) {
      setLoadingError(true)
      console.error("Error fetching reminders:", error)
      showNotification("Произошла ошибка при загрузке напоминаний", "error")
    } finally {
      setIsLoading(false)
      // Устанавливаем флаг, что напоминания были загружены
      remindersLoadedRef.current = true
    }
  }

  // Загружаем напоминания при монтировании компонента
  useEffect(() => {
    fetchReminders()
  }, [user, showNotification])

  // Фильтрация напоминаний по поисковому запросу
  const filteredReminders = reminders.filter((reminder) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      reminder.title.toLowerCase().includes(searchLower) ||
      (reminder.description && reminder.description.toLowerCase().includes(searchLower)) ||
      (reminder.tags && reminder.tags.some((tag) => tag.toLowerCase().includes(searchLower)))
    )
  })

  // Группировка напоминаний по дням
  const groupedReminders = useMemo(() => {
    // Сортируем напоминания по дате (от ближайших к более поздним)
    const sortedReminders = [...filteredReminders].sort((a, b) => a.date.getTime() - b.date.getTime())

    // Группируем по дням
    const groups: { [key: string]: { title: string; reminders: Entry[] } } = {}

    sortedReminders.forEach((reminder) => {
      let dateKey: string
      let dateTitle: string

      if (isToday(reminder.date)) {
        dateKey = "today"
        dateTitle = "Сегодня"
      } else if (isTomorrow(reminder.date)) {
        dateKey = "tomorrow"
        dateTitle = "Завтра"
      } else if (isYesterday(reminder.date)) {
        dateKey = "yesterday"
        dateTitle = "Вчера"
      } else {
        dateKey = format(reminder.date, "yyyy-MM-dd")
        dateTitle = format(reminder.date, "d MMMM yyyy", { locale: ru })
      }

      if (!groups[dateKey]) {
        groups[dateKey] = {
          title: dateTitle,
          reminders: [],
        }
      }

      groups[dateKey].reminders.push(reminder)
    })

    // Преобразуем объект в массив для удобства отображения
    return Object.entries(groups).map(([key, value]) => ({
      key,
      title: value.title,
      reminders: value.reminders,
    }))
  }, [filteredReminders])

  const handleCreateReminder = () => {
    router.push("/new/reminder")
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Mobile padding for header */}
      <div className="h-16 md:hidden" />

      <div className="flex-1 p-4 md:p-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
              <Bell className="h-5 w-5 text-amber-500" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Напоминания</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Кнопка "Новое напоминание" скрыта на мобильных устройствах */}
            <Button
              onClick={handleCreateReminder}
              className="gap-2 hidden md:flex bg-amber-600 hover:bg-amber-700"
              style={{
                boxShadow: "0 0 15px rgba(217, 119, 6, 0.5)",
              }}
            >
              <Plus className="h-4 w-4" />
              Новое напоминание
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск напоминаний..."
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
        ) : loadingError ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 mb-4">
              <Bell className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Ошибка загрузки</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              Не удалось загрузить напоминания. Пожалуйста, попробуйте обновить страницу.
            </p>
            <Button onClick={() => window.location.reload()} className="bg-amber-600 hover:bg-amber-700">
              Обновить страницу
            </Button>
          </div>
        ) : groupedReminders.length > 0 ? (
          <div className="space-y-8">
            {groupedReminders.map((group) => (
              <div key={group.key}>
                <h2 className="text-xl font-semibold mb-4 px-1">{group.title}</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {group.reminders.map((reminder, index) => (
                    <EntryCard key={reminder.id} entry={reminder} index={index} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
              <Bell className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Нет напоминаний</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              {searchQuery
                ? "Не найдено напоминаний, соответствующих вашему запросу"
                : "У вас пока нет напоминаний. Создайте новое напоминание, чтобы не забыть о важных событиях."}
            </p>
            <Button
              onClick={handleCreateReminder}
              className="bg-amber-600 hover:bg-amber-700"
              style={{
                boxShadow: "0 0 15px rgba(217, 119, 6, 0.5)",
              }}
            >
              Создать напоминание
            </Button>
          </div>
        )}
      </div>

      {/* Mobile padding for bottom navigation */}
      <div className="h-20 md:hidden" />
    </div>
  )
}
