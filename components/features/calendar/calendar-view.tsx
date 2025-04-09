"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ru } from "date-fns/locale"
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  isToday,
} from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { entries as staticEntries } from "@/data/entries"
import { useMediaQuery } from "@/hooks/use-media-query"
import type { Entry } from "@/types/entry"

interface CalendarViewProps {
  onDateSelect: (date: Date) => void
  selectedDate: Date
  dbTasks: Entry[]
}

export function CalendarView({ onDateSelect, selectedDate, dbTasks }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(selectedDate)
  const [view, setView] = useState<"week" | "month">("week")
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isSmallMobile = useMediaQuery("(max-width: 380px)")
  const today = new Date()

  // Обработчики навигации
  const handlePrevious = useCallback(() => {
    setSlideDirection("right")

    if (view === "week") {
      setCurrentDate((prev) => addDays(prev, -7))
    } else {
      setCurrentDate((prev) => addMonths(prev, -1))
    }

    // Сбрасываем направление анимации после завершения
    setTimeout(() => setSlideDirection(null), 300)
  }, [view])

  const handleNext = useCallback(() => {
    setSlideDirection("left")

    if (view === "week") {
      setCurrentDate((prev) => addDays(prev, 7))
    } else {
      setCurrentDate((prev) => addMonths(prev, 1))
    }

    // Сбрасываем направление анимации после завершения
    setTimeout(() => setSlideDirection(null), 300)
  }, [view])

  const handleToday = useCallback(() => {
    setCurrentDate(today)
    onDateSelect(today)
  }, [today, onDateSelect])

  // Обработчик переключения представления
  const handleViewChange = useCallback(
    (newView: "week" | "month") => {
      if (view === newView) return

      // При переключении на недельное представление,
      // устанавливаем текущую дату на выбранную дату
      if (newView === "week") {
        setCurrentDate(selectedDate)
      }

      setView(newView)
    },
    [view, selectedDate],
  )

  // Оптимизированная функция получения событий для дня
  const getEventsForDay = useCallback(
    (date: Date) => {
      // Получаем напоминания и заметки из статического файла
      const staticEvents = staticEntries.filter((entry) => isSameDay(entry.date, date))
      // Получаем задачи из базы данных
      const dbEvents = dbTasks.filter((entry) => isSameDay(entry.date, date))
      // Объединяем события
      return [...staticEvents, ...dbEvents]
    },
    [dbTasks],
  )

  // Мемоизированная функция для получения уникальных типов событий
  const getUniqueEventTypes = useCallback(
    (date: Date) => {
      const events = getEventsForDay(date)
      const uniqueTypes = new Set(events.map((event) => event.type))
      return Array.from(uniqueTypes).slice(0, 3)
    },
    [getEventsForDay],
  )

  // Мемоизированная функция для получения дней для отображения
  const days = useMemo(() => {
    switch (view) {
      case "week":
        return eachDayOfInterval({
          start: startOfWeek(currentDate, { locale: ru }),
          end: endOfWeek(currentDate, { locale: ru }),
        })
      case "month":
        const start = startOfMonth(currentDate)
        const end = endOfMonth(currentDate)
        const firstWeek = startOfWeek(start, { locale: ru })
        const lastWeek = endOfWeek(end, { locale: ru })
        return eachDayOfInterval({ start: firstWeek, end: lastWeek })
    }
  }, [currentDate, view])

  // Оптимизированный обработчик свайпов
  useEffect(() => {
    const calendarContainer = calendarRef.current
    if (!calendarContainer) return

    let startX = 0
    let startY = 0
    let startTime = 0

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      startX = touch.clientX
      startY = touch.clientY
      startTime = Date.now()
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - startX
      const deltaY = touch.clientY - startY
      const deltaTime = Date.now() - startTime

      // Проверяем, что это был быстрый горизонтальный свайп
      if (
        Math.abs(deltaX) > 50 && // Минимальное расстояние свайпа
        Math.abs(deltaX) > Math.abs(deltaY) && // Горизонтальное движение больше вертикального
        deltaTime < 300 // Свайп был быстрым (менее 300мс)
      ) {
        if (deltaX > 0) {
          handlePrevious()
        } else {
          handleNext()
        }
      }
    }

    calendarContainer.addEventListener("touchstart", handleTouchStart, { passive: true })
    calendarContainer.addEventListener("touchend", handleTouchEnd, { passive: true })

    return () => {
      calendarContainer.removeEventListener("touchstart", handleTouchStart)
      calendarContainer.removeEventListener("touchend", handleTouchEnd)
    }
  }, [handleNext, handlePrevious])

  // Оптимизированный обработчик колесика мыши
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      // Если это горизонтальный скролл
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 50) {
        e.preventDefault()

        if (e.deltaX > 0) {
          handleNext()
        } else {
          handlePrevious()
        }
      }
    },
    [handleNext, handlePrevious],
  )

  // Предотвращаем стандартное поведение горизонтального скролла
  useEffect(() => {
    const currentRef = calendarRef.current

    const preventDefaultScroll = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault()
      }
    }

    currentRef?.addEventListener("wheel", preventDefaultScroll, { passive: false })

    return () => {
      currentRef?.removeEventListener("wheel", preventDefaultScroll)
    }
  }, [])

  // Мемоизированные названия дней недели
  const dayNames = useMemo(() => {
    return eachDayOfInterval({
      start: startOfWeek(new Date(), { locale: ru }),
      end: endOfWeek(new Date(), { locale: ru }),
    }).map((date) => format(date, isSmallMobile ? "EEEEE" : "EEEEEE", { locale: ru }).toUpperCase())
  }, [isSmallMobile])

  // Оптимизированная функция для получения цвета типа события
  const getEventTypeColor = useCallback((type: Entry["type"], isSelected: boolean) => {
    if (isSelected) return "bg-white/90"

    switch (type) {
      case "task":
        return "bg-blue-500"
      case "reminder":
        return "bg-amber-500"
      case "note":
        return "bg-emerald-500"
      default:
        return "bg-gray-500"
    }
  }, [])

  // Мемоизированный месяц и год для отображения
  const capitalizedMonthYear = useMemo(() => {
    const monthYear = format(currentDate, "LLLL yyyy", { locale: ru })
    return monthYear.charAt(0).toUpperCase() + monthYear.slice(1)
  }, [currentDate])

  // Оптимизированный рендеринг дней недели
  const renderWeekView = useCallback(() => {
    return (
      <div className="grid grid-cols-7 gap-2 p-3 sm:p-4 md:p-6">
        {days.map((date) => {
          const eventTypes = getUniqueEventTypes(date)
          const isSelected = isSameDay(date, selectedDate)
          const isCurrentDay = isToday(date)
          const isCurrentMonth = isSameMonth(date, currentDate)
          const dayNumber = format(date, "d")
          const events = getEventsForDay(date)
          const hasEvents = events.length > 0

          return (
            <button
              key={date.toString()}
              onClick={() => onDateSelect(date)}
              className={cn(
                "flex flex-col items-center justify-start rounded-xl p-2 sm:p-3 text-center relative overflow-hidden group",
                "transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 active:scale-95",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-md"
                  : isCurrentDay
                    ? "bg-primary/5 shadow-sm border border-primary/10"
                    : !isCurrentMonth
                      ? "text-muted-foreground/50"
                      : hasEvents
                        ? "hover:bg-primary/5 hover:border-primary/10 hover:shadow-sm border border-transparent"
                        : "hover:bg-accent/30",
              )}
            >
              {isSelected && <div className="absolute inset-0 bg-primary/10 z-0" />}

              {hasEvents && !isSelected && (
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-0" />
              )}

              <span
                className={cn(
                  "text-sm sm:text-base relative z-10 mb-1",
                  isSelected ? "font-bold" : isCurrentDay ? "font-semibold" : "font-medium",
                )}
              >
                {dayNumber}
              </span>

              {eventTypes.length > 0 && (
                <div className="flex justify-center gap-1 mt-auto z-10">
                  {eventTypes.map((type, idx) => (
                    <span
                      key={idx}
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        getEventTypeColor(type, isSelected),
                        isSelected && "shadow-sm",
                      )}
                    />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>
    )
  }, [days, selectedDate, currentDate, getUniqueEventTypes, getEventsForDay, getEventTypeColor, onDateSelect])

  // Оптимизированный рендеринг месячного представления
  const renderMonthView = useCallback(() => {
    return (
      <div className="p-3 sm:p-4 md:p-6">
        <div className="grid grid-cols-7 gap-1">
          {days.map((date) => {
            const eventTypes = getUniqueEventTypes(date)
            const isSelected = isSameDay(date, selectedDate)
            const isCurrentDay = isToday(date)
            const isCurrentMonth = isSameMonth(date, currentDate)
            const dayNumber = format(date, "d")
            const events = getEventsForDay(date)
            const hasEvents = events.length > 0

            return (
              <div key={date.toString()} className="p-0.5">
                <button
                  onClick={() => onDateSelect(date)}
                  className={cn(
                    "w-full h-8 sm:h-9 flex flex-col items-center justify-center rounded-md text-center relative overflow-hidden group",
                    "transition-all duration-200 hover:scale-105 active:scale-95",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-md"
                      : isCurrentDay
                        ? "bg-primary/5 shadow-sm border border-primary/10"
                        : !isCurrentMonth
                          ? "text-muted-foreground/40"
                          : hasEvents
                            ? "hover:bg-primary/5 hover:border-primary/10 hover:shadow-sm border border-transparent"
                            : "hover:bg-accent/30",
                  )}
                >
                  {isSelected && <div className="absolute inset-0 bg-primary/10 z-0" />}

                  {hasEvents && !isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-0" />
                  )}

                  <span
                    className={cn(
                      "text-xs sm:text-sm relative z-10",
                      isSelected ? "font-bold" : isCurrentDay ? "font-semibold" : "font-medium",
                    )}
                  >
                    {dayNumber}
                  </span>

                  {eventTypes.length > 0 && (
                    <div className="absolute bottom-0.5 flex justify-center gap-0.5 z-10">
                      {eventTypes.map((type, idx) => (
                        <span
                          key={idx}
                          className={cn(
                            "h-1 w-1 rounded-full",
                            getEventTypeColor(type, isSelected),
                            isSelected && "shadow-sm",
                          )}
                        />
                      ))}
                    </div>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    )
  }, [days, selectedDate, currentDate, getUniqueEventTypes, getEventsForDay, getEventTypeColor, onDateSelect])

  return (
    <div
      className="w-full overflow-hidden rounded-xl bg-white dark:bg-zinc-900 shadow-md border border-slate-200/50 dark:border-slate-800/50"
      ref={calendarRef}
      onWheel={handleWheel}
    >
      {/* Заголовок календаря */}
      <div className="flex flex-col gap-3 p-4 sm:p-5 md:p-6 border-b border-slate-200/70 dark:border-slate-800/70 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 dark:to-transparent relative overflow-hidden">
        {/* Декоративные элементы (статические) */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl opacity-30 -translate-y-20 translate-x-20"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-3xl opacity-20 translate-y-20 -translate-x-20"></div>

        <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
              <CalendarIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl sm:text-2xl font-medium whitespace-nowrap tracking-tight">
                {capitalizedMonthYear}
              </h2>
              <p className="text-xs text-muted-foreground/80 font-medium">
                {view === "week" ? "Недельный просмотр" : "Месячный просмотр"}
              </p>
            </div>

            {/* Показываем кнопки навигации только на десктопе */}
            {!isMobile && (
              <div className="flex gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevious}
                  className="h-8 w-8 rounded-full hover:bg-white/80 dark:hover:bg-zinc-800/80 hover:text-primary shadow-sm border border-slate-200/50 dark:border-slate-700/50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  className="h-8 w-8 rounded-full hover:bg-white/80 dark:hover:bg-zinc-800/80 hover:text-primary shadow-sm border border-slate-200/50 dark:border-slate-700/50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Переработанные кнопки управления */}
          <div className="flex items-center gap-2">
            {/* Кнопка "Сегодня" */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToday}
              className="h-9 px-4 rounded-lg bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-800 hover:text-primary transition-all duration-200 shadow-sm border border-slate-200/50 dark:border-slate-700/50 font-medium"
            >
              Сегодня
            </Button>

            {/* Переключатель режимов просмотра */}
            <div className="flex h-9 rounded-lg overflow-hidden shadow-sm border border-slate-200/50 dark:border-slate-700/50">
              <button
                onClick={() => handleViewChange("week")}
                className={cn(
                  "px-4 h-full transition-all duration-200 font-medium text-sm",
                  view === "week"
                    ? "bg-primary text-primary-foreground shadow-inner"
                    : "bg-white/90 dark:bg-zinc-800/90 text-muted-foreground hover:text-foreground hover:bg-white dark:hover:bg-zinc-800 hover:text-primary",
                )}
              >
                Неделя
              </button>
              <button
                onClick={() => handleViewChange("month")}
                className={cn(
                  "px-4 h-full transition-all duration-200 font-medium text-sm",
                  view === "month"
                    ? "bg-primary text-primary-foreground shadow-inner"
                    : "bg-white/90 dark:bg-zinc-800/90 text-muted-foreground hover:text-foreground hover:bg-white dark:hover:bg-zinc-800 hover:text-primary",
                )}
              >
                Месяц
              </button>
            </div>
          </div>
        </div>

        {/* Дни недели */}
        <div className="grid grid-cols-7 gap-2 text-center mt-4 relative z-10 bg-white/40 dark:bg-zinc-800/40 backdrop-blur-sm rounded-lg py-2 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
          {dayNames.map((day, index) => (
            <div key={index} className="text-xs font-medium text-slate-600 dark:text-slate-400">
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Индикатор свайпа для мобильных устройств */}
      {isMobile && (
        <div className="flex justify-center items-center py-1.5 text-muted-foreground text-xs bg-slate-50/80 dark:bg-zinc-800/80 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50">
          <ChevronLeft className="h-3 w-3 mr-1" />
          Свайпните для навигации
          <ChevronRight className="h-3 w-3 ml-1" />
        </div>
      )}

      {/* Контейнер календаря с содержимым */}
      <div
        className={cn(
          "relative bg-white dark:bg-zinc-900 transition-all duration-300",
          slideDirection === "left" ? "animate-slideLeft" : slideDirection === "right" ? "animate-slideRight" : "",
        )}
      >
        {view === "week" ? renderWeekView() : renderMonthView()}
      </div>
    </div>
  )
}
