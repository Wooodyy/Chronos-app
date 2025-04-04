"use client"
import { Bell, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EntriesList } from "@/components/features/entries/entries-list"
import { entries } from "@/data/entries"
import { useRouter } from "next/navigation"

// Import the necessary hooks and add a useEffect to refresh user data
import { useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"

export default function RemindersPage() {
  const router = useRouter()
  const { refreshData, user } = useAuth()
  const userDataRefreshedRef = useRef(false)

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

  // Фильтруем только напоминания
  const reminders = entries.filter((entry) => entry.type === "reminder")

  return (
    <div className="flex flex-col min-h-full">
      {/* Mobile padding for header */}
      <div className="h-16 md:hidden" />

      <div className="flex-1 p-4 md:p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 aspect-square">
              <Bell className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Напоминания</h1>
              <p className="text-sm text-muted-foreground mt-1">Управляйте своими напоминаниями</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => router.push("/new/reminder")} className="gap-2 hidden md:flex">
              <Plus className="h-4 w-4" />
              Создать напоминание
            </Button>
          </div>
        </div>

        <EntriesList entries={reminders} showDate={true} />
      </div>

      {/* Mobile padding for bottom navigation */}
      <div className="h-20 md:hidden" />
    </div>
  )
}

