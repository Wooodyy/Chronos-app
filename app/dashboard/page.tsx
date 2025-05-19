"use client"

import { useState, useEffect, useRef } from "react"
import { CalendarView } from "@/components/features/calendar/calendar-view"
import { EntriesList } from "@/components/features/entries/entries-list"
import { AddEntryButton } from "@/components/features/entries/add-entry-button"
import { isSameDay, isAfter, isBefore, getDay, getDate } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ListCollapse, ListTodo, Bell, BookMarked, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import type { Entry } from "@/types/entry"
// Добавим импорт useLanguage
import { useLanguage } from "@/contexts/language-context"

// Функция для преобразования даты из строки или объекта Date
const ensureDate = (dateInput: string | Date): Date => {
  if (dateInput instanceof Date) {
    return dateInput
  }
  return new Date(dateInput)
}

// Обновим компонент DashboardPage, добавив поддержку многоязычности
export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isCompact, setIsCompact] = useState(false)
  const [dbTasks, setDbTasks] = useState<Entry[]>([])
  const [dbNotes, setDbNotes] = useState<Entry[]>([])
  const [dbReminders, setDbReminders] = useState<Entry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user, refreshData } = useAuth()
  const dataFetchedRef = useRef(false)
  const userDataRefreshedRef = useRef(false)
  const { t, language } = useLanguage() // Добавляем использование контекста языка

  // Добавим проверку, были ли уже загружены данные в текущей сессии
  const dashboardDataLoadedRef = useRef(false)

  // Эффект для обработки изменения размера экрана
  useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth < 500)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Изменим useEffect для загрузки данных
  useEffect(() => {
    // Функция для загрузки данных
    const fetchData = async () => {
      if (!user?.login) return

      // Проверяем, были ли уже загружены данные в текущей сессии
      const dashboardDataLoaded = sessionStorage.getItem("dashboard_data_loaded") === "true"
      if (dashboardDataLoaded && dashboardDataLoadedRef.current) {
        console.log("Dashboard data already loaded in this session")
        return
      }

      // Сбрасываем флаг при изменении пользователя
      if (dataFetchedRef.current && user.login) {
        dataFetchedRef.current = false
      }

      if (dataFetchedRef.current) return

      setIsLoading(true)
      try {
        // Загружаем задачи
        const timestamp = new Date().getTime()
        const tasksResponse = await fetch(`/api/tasks/user/${user.login}?t=${timestamp}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        })

        const tasksData = await tasksResponse.json()

        if (tasksData.success && tasksData.tasks) {
          setDbTasks(tasksData.tasks)
        }

        // Загружаем заметки
        const notesResponse = await fetch(`/api/notes/user/${user.login}?t=${timestamp}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        })

        const notesData = await notesResponse.json()

        if (notesData.success && notesData.notes) {
          setDbNotes(notesData.notes)
        }

        // Загружаем напоминания
        const remindersResponse = await fetch(`/api/reminders/user/${user.login}?t=${timestamp}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        })

        const remindersData = await remindersResponse.json()

        if (remindersData.success && remindersData.reminders) {
          setDbReminders(remindersData.reminders)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setIsLoading(false)
        dataFetchedRef.current = true
        // Устанавливаем флаг, что данные были загружены
        sessionStorage.setItem("dashboard_data_loaded", "true")
        dashboardDataLoadedRef.current = true
      }
    }

    fetchData()
  }, [user?.login])

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

  // Объединяем все записи
  const allEntries = [...dbReminders, ...dbTasks, ...dbNotes]

  // Функция для проверки, должно ли повторяющееся напоминание отображаться на указанную дату
  const shouldShowRecurringReminder = (reminder: Entry, date: Date): boolean => {
    // Для не-напоминаний или напоминаний без повторения просто сравниваем даты
    if (reminder.type !== "reminder" || !reminder.repeat_type || reminder.repeat_type === "none") {
      return isSameDay(ensureDate(reminder.date), date)
    }

    // Преобразуем даты в объекты Date
    const reminderDate = ensureDate(reminder.date)

    // Проверяем, находится ли дата в пределах периода повторения
    // Если дата раньше начальной даты напоминания, то не показываем
    if (isBefore(date, reminderDate)) {
      return false
    }

    // Если есть дата окончания повторения и выбранная дата позже неё, то не показываем
    if (reminder.repeat_until && isAfter(date, ensureDate(reminder.repeat_until))) {
      return false
    }

    // Проверяем по типу повторения
    switch (reminder.repeat_type) {
      case "daily":
        // Для ежедневного повторения всегда возвращаем true, если дата в пределах периода
        return true

      case "weekly":
        // Для еженедельного повторения проверяем день недели
        if (!reminder.repeat_days || reminder.repeat_days.length === 0) {
          // Если дни недели не указаны, проверяем совпадение дня недели с исходной датой
          return getDay(date) === getDay(reminderDate)
        }

        // Проверяем, входит ли день недели выбранной даты в список дней повторения
        const dayOfWeek = getDay(date)
        return reminder.repeat_days.includes(dayOfWeek)

      case "monthly":
        // Для ежемесячного повторения проверяем число месяца
        const reminderDay = getDate(reminderDate)
        const dateDay = getDate(date)

        return reminderDay === dateDay

      default:
        return isSameDay(reminderDate, date)
    }
  }

  // Фильтруем записи по выбранной дате
  const dayEntries = allEntries.filter((entry) => {
    if (entry.type === "reminder" && entry.repeat_type && entry.repeat_type !== "none") {
      return shouldShowRecurringReminder(entry, selectedDate)
    }
    return isSameDay(ensureDate(entry.date), selectedDate)
  })

  const tasks = dayEntries.filter((entry) => entry.type === "task")
  const reminders = dayEntries.filter((entry) => entry.type === "reminder")
  const notes = dayEntries.filter((entry) => entry.type === "note")

  // Функция для форматирования даты с учетом выбранного языка
  const formatDateForLanguage = (date: Date) => {
    // Получаем день месяца
    const day = date.getDate()

    // Получаем название месяца в зависимости от языка
    let month = ""
    const monthIndex = date.getMonth()
    const monthKeys = [
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

    month = t(monthKeys[monthIndex])

    // Возвращаем отформатированную дату
    return `${day} ${month}`
  }

  return (
    <div className="flex flex-col min-h-full">
      <div className="h-16 md:hidden" />

      <div className="flex-1 p-4 md:p-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
            <p className="text-muted-foreground mt-1">
              {t("dashboard.welcome")}, {user?.name || "Пользователь"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <AddEntryButton />
          </div>
        </div>

        <Card className="overflow-hidden border-none shadow-md">
          <CardContent className="p-0">
            <CalendarView
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              dbTasks={[...dbTasks, ...dbNotes, ...dbReminders]}
            />
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
                  {!isCompact && <span>{t("dashboard.all")}</span>}
                </span>
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex-auto min-w-fit">
                <span className="flex items-center gap-2">
                  <ListTodo className="h-4 w-4" />
                  {!isCompact && <span>{t("dashboard.tasks")}</span>}
                </span>
              </TabsTrigger>
              <TabsTrigger value="reminders" className="flex-auto min-w-fit">
                <span className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  {!isCompact && <span>{t("dashboard.reminders")}</span>}
                </span>
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex-auto min-w-fit">
                <span className="flex items-center gap-2">
                  <BookMarked className="h-4 w-4" />
                  {!isCompact && <span>{t("dashboard.notes")}</span>}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <EntriesList
                entries={dayEntries}
                title={`${t("dashboard.eventsFor")} ${formatDateForLanguage(selectedDate)}`}
              />
            </TabsContent>

            <TabsContent value="tasks" className="mt-0">
              <EntriesList entries={tasks} title={t("dashboard.tasks")} />
            </TabsContent>

            <TabsContent value="reminders" className="mt-0">
              <EntriesList entries={reminders} title={t("dashboard.reminders")} />
            </TabsContent>

            <TabsContent value="notes" className="mt-0">
              <EntriesList entries={notes} title={t("dashboard.notes")} />
            </TabsContent>
          </Tabs>
        )}
      </div>

      <div className="h-20 md:hidden" />
    </div>
  )
}
