"use client"

import { useState, useEffect } from "react"
import { CheckSquare, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EntriesList } from "@/components/features/entries/entries-list"
import { SearchButton } from "@/components/shared/search-button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import type { Entry } from "@/types/entry"

export default function TasksPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [tasks, setTasks] = useState<Entry[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Загружаем задачи пользователя из базы данных
  useEffect(() => {
    const fetchUserTasks = async () => {
      if (!user?.login) return

      setIsLoading(true)
      try {
        const response = await fetch(`/api/tasks/user/${user.login}`)
        const data = await response.json()

        if (data.success && data.tasks) {
          setTasks(data.tasks)
        }
      } catch (error) {
        console.error("Error fetching user tasks:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserTasks()
  }, [user])

  // Фильтруем задачи по поисковому запросу
  const filteredTasks = tasks.filter(
    (task) =>
      searchQuery === "" ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex flex-col min-h-full">
      {/* Mobile padding for header */}
      <div className="h-16 md:hidden" />

      <div className="flex-1 p-4 md:p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
              <CheckSquare className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Задачи</h1>
              <p className="text-muted-foreground mt-1">Управляйте своими задачами</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <SearchButton onSearch={setSearchQuery} />
            <Button onClick={() => router.push("/new/task")} className="gap-2 hidden md:flex">
              <Plus className="h-4 w-4" />
              Создать задачу
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <EntriesList entries={filteredTasks} showDate={true} />
        )}
      </div>

      {/* Mobile padding for bottom navigation */}
      <div className="h-20 md:hidden" />
    </div>
  )
}

