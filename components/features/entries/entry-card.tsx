"use client"

import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { CheckCircle2, Circle, Bell, FileText, ListTodo, Clock } from "lucide-react"
import type { Entry } from "@/types/entry"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const typeIcons = {
  task: ListTodo,
  reminder: Bell,
  note: FileText,
}

const typeColors = {
  task: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
  reminder: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
  note: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
}

const priorityColors = {
  low: "text-success",
  medium: "text-warning",
  high: "text-destructive",
}

interface EntryCardProps {
  entry: Entry
  index?: number
}

export function EntryCard({ entry, index = 0 }: EntryCardProps) {
  const Icon = typeIcons[entry.type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/entries/${entry.id}`} className="block">
        <Card className="group hover:shadow-md transition-all duration-200 overflow-hidden border-none shadow-sm">
          <div
            className={cn(
              "h-1",
              entry.type === "task" ? "bg-blue-500" : entry.type === "reminder" ? "bg-amber-500" : "bg-emerald-500",
            )}
          />
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn("px-2 py-0 h-5", typeColors[entry.type])}>
                  <Icon className="h-3 w-3 mr-1" />
                  <span className="text-xs">
                    {entry.type === "task" ? "Задача" : entry.type === "reminder" ? "Напоминание" : "Заметка"}
                  </span>
                </Badge>
                <CardTitle className="text-base font-medium">{entry.title}</CardTitle>
              </div>
              <CardDescription className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(entry.date, "HH:mm", { locale: ru })}
              </CardDescription>
            </div>
            {entry.type === "task" && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                {entry.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{entry.description}</p>
            <div className="flex flex-wrap gap-2">
              {entry.priority && (
                <Badge variant="outline" className={priorityColors[entry.priority]}>
                  {entry.priority === "low" ? "Низкий" : entry.priority === "medium" ? "Средний" : "Высокий"}
                </Badge>
              )}
              {entry.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-secondary/50">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

