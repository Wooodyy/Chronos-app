"use client"

import { useState, useEffect } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { CheckSquare, Bell, FileText, LayoutGrid } from "lucide-react"

interface FilterTabsProps {
  onFilterChange: (filter: string) => void
  initialFilter?: string
  className?: string
}

export function FilterTabs({ onFilterChange, initialFilter = "all", className }: FilterTabsProps) {
  const [activeFilter, setActiveFilter] = useState(initialFilter)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  // Фильтры с их иконками и текстом
  const filters = [
    { id: "all", icon: <LayoutGrid className="h-4 w-4" />, text: "Все" },
    { id: "tasks", icon: <CheckSquare className="h-4 w-4" />, text: "Задачи" },
    { id: "reminders", icon: <Bell className="h-4 w-4" />, text: "Напоминания" },
    { id: "notes", icon: <FileText className="h-4 w-4" />, text: "Заметки" },
  ]

  useEffect(() => {
    onFilterChange(activeFilter)
  }, [activeFilter, onFilterChange])

  return (
    <div className={cn("flex items-center gap-1 bg-muted/50 rounded-lg p-1", className)}>
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => setActiveFilter(filter.id)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md transition-all",
            activeFilter === filter.id
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
          )}
        >
          {filter.icon}
          {isDesktop && <span>{filter.text}</span>}
        </button>
      ))}
    </div>
  )
}
