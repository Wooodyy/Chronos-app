"use client"

import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import type { Entry } from "@/types/entry"
import { EntryCard } from "@/components/features/entries/entry-card"
import { CalendarDays } from "lucide-react"

interface EntriesListProps {
  entries: Entry[]
  showDate?: boolean
  title?: string
}

export function EntriesList({ entries, showDate = false, title }: EntriesListProps) {
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

  return (
    <div className="space-y-8">
      {title && (
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-medium flex items-center gap-2">{title}</h3>
          <span className="text-sm text-muted-foreground px-2 py-1 bg-muted rounded-full">
            {entries.length}{" "}
            {entries.length === 1 ? "запись" : entries.length >= 2 && entries.length <= 4 ? "записи" : "записей"}
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
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {dateEntries.map((entry, index) => (
                <EntryCard key={entry.id} entry={entry} index={index} />
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
          <h3 className="text-lg font-medium mb-2">Записей не найдено</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            На выбранную дату нет записей. Создайте новую запись, нажав на кнопку "Создать".
          </p>
        </motion.div>
      )}
    </div>
  )
}

