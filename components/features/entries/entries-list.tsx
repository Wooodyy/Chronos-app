"use client"

import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import type { Entry } from "@/types/entry"
import { EntryCard } from "@/components/features/entries/entry-card"
import { CalendarDays } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface EntriesListProps {
  entries: Entry[]
  showDate?: boolean
  title?: string
}

export function EntriesList({ entries, showDate = false, title }: EntriesListProps) {
  const { t, language } = useLanguage()

  // Группируем записи по дате, если нужно показывать даты
  const groupedEntries = showDate
    ? entries.reduce(
        (groups, entry) => {
          const date = format(entry.date, "yyyy-MM-dd")
          if (!groups[date]) {
            groups[date] = []
          }
          groups[date].push(entry)
          return groups
        },
        {} as Record<string, Entry[]>,
      )
    : { all: entries }

  // Функция для обновления статуса задачи
  const handleTaskComplete = async (id: string, completed: boolean): Promise<boolean> => {
    try {
      const response = await fetch(`/api/tasks/${id}/complete`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed }),
      })

      return response.ok
    } catch (error) {
      console.error("Error updating task completion status:", error)
      return false
    }
  }

  // Функция для определения правильного склонения слова "событие"
  const getEventCountText = (count: number) => {
    if (language === "ru") {
      if (count === 1) {
        return t("events.count.one")
      } else if (count >= 2 && count <= 4) {
        return t("events.count.few")
      } else {
        return t("events.count.many")
      }
    } else if (language === "kz") {
      return t("events.count.many")
    } else {
      return count === 1 ? t("events.count.one") : t("events.count.many")
    }
  }

  return (
    <div className="space-y-8">
      {title && (
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-medium flex items-center gap-2">{title}</h3>
          <span className="text-sm text-muted-foreground px-2 py-1 bg-muted rounded-full">
            {entries.length} {getEventCountText(entries.length)}
          </span>
        </div>
      )}

      {Object.entries(groupedEntries).map(([date, dateEntries]) => (
        <div key={date} className="space-y-4">
          {showDate && (
            <div className="flex items-center gap-2 sticky top-0 bg-background py-2 z-10">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-lg font-medium">{format(new Date(date), "d MMMM", { locale: ru })}</h3>
            </div>
          )}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {dateEntries.map((entry, index) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  index={index}
                  onTaskComplete={entry.type === "task" ? handleTaskComplete : undefined}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      ))}

      {entries.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 px-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
            <CalendarDays className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">{t("events.empty.title")}</h3>
          <p className="text-muted-foreground max-w-md mx-auto">{t("events.empty.description")}</p>
        </motion.div>
      )}
    </div>
  )
}
