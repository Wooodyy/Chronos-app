"use client"

import type React from "react"

import { useState } from "react"
import {
  format,
  differenceInMonths,
  differenceInDays,
  differenceInHours,
  isBefore,
  differenceInMinutes,
} from "date-fns"
import { ru } from "date-fns/locale"
import { Bell, FileText, ListTodo, Clock, Check, AlertTriangle } from "lucide-react"
import type { Entry } from "@/types/entry"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import { useNotification } from "@/components/ui/notification"

const typeIcons = {
  task: ListTodo,
  reminder: Bell,
  note: FileText,
}

const priorityColors = {
  low: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200",
  medium: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200",
  high: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200",
}

const priorityLabels = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
}

// Function to calculate and format time remaining
function getTimeRemaining(date: Date): string {
  const now = new Date().toISOString()

  // If the date is in the past
  if (isBefore(date, now)) {
    return "Просрочено"
  }

  const monthsDiff = differenceInMonths(date, now)
  const daysDiff = differenceInDays(date, now) % 30 // Days remaining after months
  const hoursDiff = differenceInHours(date, now) % 24 // Hours remaining after days
  const minutesDiff = differenceInMinutes(date, now) % 60 // Minutes remaining after hours

  let result = ""

  if (monthsDiff > 0) {
    result += `${monthsDiff} ${monthsDiff === 1 ? "месяц" : monthsDiff < 5 ? "месяца" : "месяцев"}`
    if (daysDiff > 0) {
      result += ` ${daysDiff} ${daysDiff === 1 ? "день" : daysDiff < 5 ? "дня" : "дней"}`
    }
    return result
  }

  if (daysDiff > 0) {
    result += `${daysDiff} ${daysDiff === 1 ? "день" : daysDiff < 5 ? "дня" : "дней"}`
    if (hoursDiff > 0) {
      result += ` ${hoursDiff} ${hoursDiff === 1 ? "час" : hoursDiff < 5 ? "часа" : "часов"}`
    }
    return result
  }

  if (hoursDiff > 0) {
    result += `${hoursDiff} ${hoursDiff === 1 ? "час" : hoursDiff < 5 ? "часа" : "часов"}`
    if (minutesDiff > 0) {
      result += ` ${minutesDiff} ${minutesDiff === 1 ? "минута" : minutesDiff < 5 ? "минуты" : "минут"}`
    }
    return result
  }

  return `${minutesDiff} ${minutesDiff === 1 ? "минута" : minutesDiff < 5 ? "минуты" : "минут"}`
}

interface EntryCardProps {
  entry: Entry
  index?: number
  onTaskComplete?: (id: string, completed: boolean) => Promise<boolean>
}

export function EntryCard({ entry, index = 0, onTaskComplete }: EntryCardProps) {
  const Icon = typeIcons[entry.type]
  const [isCompleted, setIsCompleted] = useState(entry.completed || false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { showNotification } = useNotification()

  const handleToggleComplete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (entry.type === "task") {
      // Запускаем анимацию только если задача отмечается как выполненная
      const willBeCompleted = !isCompleted
      if (willBeCompleted) {
        setIsAnimating(true)
      }

      // If there's a callback for updating task status
      if (onTaskComplete) {
        try {
          const success = await onTaskComplete(entry.id, willBeCompleted)

          if (success) {
            // If task was successfully updated, change state
            setIsCompleted(willBeCompleted)
            showNotification(
              willBeCompleted ? "Задача отмечена как выполненная" : "Задача отмечена как невыполненная",
              "success",
            )

            // Allow animation to complete before stopping (только если была запущена анимация)
            if (willBeCompleted) {
              setTimeout(() => {
                setIsAnimating(false)
              }, 1000)
            }
          } else {
            setIsAnimating(false)
            showNotification("Не удалось обновить статус задачи", "error")
          }
        } catch (error) {
          setIsAnimating(false)
          showNotification("Произошла ошибка при обновлении статуса задачи", "error")
        }
      } else {
        // If no callback, just change local state
        setIsCompleted(willBeCompleted)
        if (willBeCompleted) {
          setTimeout(() => {
            setIsAnimating(false)
          }, 1000)
        }
      }
    }
  }

  // Calculate time remaining
  const timeRemaining = getTimeRemaining(entry.date)
  const isPastDue = timeRemaining === "Просрочено" && !isCompleted

  // Определяем URL для перехода в зависимости от типа записи
  const getEntryUrl = () => {
    // Get the current path to use as source
    const currentPath = window.location.pathname
    const source = currentPath.includes("/notes") ? "notes" : currentPath.includes("/tasks") ? "tasks" : "dashboard"

    switch (entry.type) {
      case "task":
        return `/tasks/${entry.id}?source=${source}`
      case "note":
        return `/notes/${entry.id}?source=${source}`
      case "reminder":
        return `/reminders/${entry.id}?source=${source}`
      default:
        return `/entries/${entry.id}?source=${source}`
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        className={cn(
          "overflow-hidden border transition-all duration-300 hover:shadow-lg h-[140px]",
          isHovered ? "translate-y-[-2px]" : "shadow-sm",
          isCompleted && entry.type === "task" ? "bg-muted/30" : "bg-card",
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex p-4 gap-3 h-full">
          {/* Left column with icon and checkbox */}
          <div className="flex flex-col items-center gap-3">
            {/* Task type icon */}
            <div
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full",
                entry.type === "task"
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                  : entry.type === "reminder"
                    ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                    : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
              )}
            >
              <Icon className="h-3 w-3" />
            </div>

            {/* Checkbox for tasks - now vertically centered */}
            {entry.type === "task" && (
              <div className="flex-shrink-0 cursor-pointer mt-2" onClick={handleToggleComplete}>
                <div className="w-6 h-6 relative">
                  {isAnimating ? (
                    <DotLottieReact
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Animation%20-%201742562962548%20%281%29-OdSF1TwBXuXhQeyASo51sRaAZhPggB.json"
                      autoplay={true}
                      loop={false}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12"
                    />
                  ) : isCompleted ? (
                    <div className="w-6 h-6 rounded-sm bg-blue-500 flex items-center justify-center">
                      <Check strokeWidth={5} className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "w-6 h-6 rounded-sm border-2 flex items-center justify-center transition-colors",
                        isHovered ? "border-blue-500 bg-blue-100/50 dark:bg-blue-900/30" : "border-muted-foreground/30",
                      )}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Card content */}
          <Link href={getEntryUrl()} className="flex-grow min-w-0 flex flex-col justify-between h-full">
            <div className="flex flex-col">
              {/* Header with title and time */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3
                  className={cn(
                    "text-base font-medium leading-tight truncate",
                    isCompleted && entry.type === "task" ? "line-through text-muted-foreground" : "text-foreground",
                  )}
                >
                  {entry.title}
                </h3>

                {/* Time badge - moved to right side */}
                <div className="flex-shrink-0">
                  <div className="text-xs font-medium text-muted-foreground">
                    {format(entry.date, "HH:mm", { locale: ru })}
                  </div>
                </div>
              </div>

              <p
                className={cn(
                  "text-sm text-muted-foreground truncate",
                  isCompleted && entry.type === "task" ? "line-through" : "",
                )}
              >
                {entry.description}
              </p>
            </div>

            {/* Footer with metadata */}
            <div className="flex flex-wrap gap-2 mt-auto">
              {/* Time remaining - styled like tags */}
              <div
                className={cn(
                  "text-xs py-0 h-5 rounded-full px-2",
                  isPastDue ? "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" : "bg-secondary/30",
                )}
              >
                {isPastDue ? (
                  <span className="flex items-center justify-center h-full gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {timeRemaining}
                  </span>
                ) : (
                  <span className="flex items-center justify-center h-full gap-1">
                    <Clock className="h-3 w-3" />
                    {timeRemaining}
                  </span>
                )}
              </div>

              {/* Priority - styled like tags */}
              {entry.priority && (
                <div
                  className={cn(
                    "text-xs h-5 rounded-full px-2 flex items-center justify-center",
                    entry.priority === "low"
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : entry.priority === "medium"
                        ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
                  )}
                >
                  {priorityLabels[entry.priority]}
                </div>
              )}

              {/* Tags */}
              {entry.tags && entry.tags.length > 0 && (
                <div className="flex gap-1 ml-auto">
                  {entry.tags.slice(0, 2).map((tag) => (
                    <div
                      key={tag}
                      className="text-xs h-5 rounded-full px-2 bg-secondary/30 flex items-center justify-center"
                    >
                      {tag}
                    </div>
                  ))}
                  {entry.tags.length > 2 && (
                    <div className="text-xs h-5 rounded-full px-2 bg-secondary/30 flex items-center justify-center">
                      +{entry.tags.length - 2}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Link>
        </div>
      </Card>
    </motion.div>
  )
}

