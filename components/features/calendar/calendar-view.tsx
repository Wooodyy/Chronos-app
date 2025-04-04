"use client"

import React from "react"
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
import { motion, AnimatePresence } from "framer-motion"
import { useMediaQuery } from "@/hooks/use-media-query"
import type { Entry } from "@/types/entry"

interface CalendarViewProps {
  onDateSelect: (date: Date) => void
  selectedDate: Date
  dbTasks: Entry[]
}

export function CalendarView({ onDateSelect, selectedDate, dbTasks }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = React.useState(selectedDate)
  const [view, setView] = React.useState<"week" | "month">("week")
  const [direction, setDirection] = React.useState(0)
  const calendarRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const swipeRef = React.useRef<{
    startX: number
    startY: number
    startTime: number
  } | null>(null)
  const [contentHeight, setContentHeight] = React.useState<number | null>(null)
  const [isAnimating, setIsAnimating] = React.useState(false)
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isSmallMobile = useMediaQuery("(max-width: 380px)")
  const today = new Date()

  // Обновляем высоту контента при изменении представления или размера окна
  React.useEffect(() => {
    const updateHeight = () => {
      if (contentRef.current) {
        const height = contentRef.current.scrollHeight
        setContentHeight(height)
      }
    }

    // Обновляем высоту после рендеринга
    updateHeight()

    // Добавляем слушатль изменения размера окна
    window.addEventListener("resize", updateHeight)

    // Очищаем слушатель при размонтировании
    return () => {
      window.removeEventListener("resize", updateHeight)
    }
  }, [view, currentDate])

  const handlePrevious = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setDirection(-1)

    switch (view) {
      case "week":
        setCurrentDate((prev) => addDays(prev, -7))
        break
      case "month":
        setCurrentDate((prev) => addMonths(prev, -1))
        break
    }
  }

  const handleNext = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setDirection(1)

    switch (view) {
      case "week":
        setCurrentDate((prev) => addDays(prev, 7))
        break
      case "month":
        setCurrentDate((prev) => addMonths(prev, 1))
        break
    }
  }

  const handleToday = () => {
    setCurrentDate(today)
    onDateSelect(today)
  }

  // Обработчик переключения представления
  const handleViewChange = (newView: "week" | "month") => {
    if (view === newView) return

    // При переключении на недельное представление,
    // устанавливаем текущую дату на выбранную дату
    if (newView === "week") {
      setCurrentDate(selectedDate)
    }

    setView(newView)
  }

  const getEventsForDay = (date: Date) => {
    // Получаем напоминания и заметки из статического файла
    const staticEvents = staticEntries.filter((entry) => isSameDay(entry.date, date))

    // Получаем задачи из базы данных
    const dbEvents = dbTasks.filter((entry) => isSameDay(entry.date, date))

    // Объединяем события
    return [...staticEvents, ...dbEvents]
  }

  // Функция для получения уникальных типов событий для дня (максимум 3 типа)
  const getUniqueEventTypes = (date: Date) => {
    const events = getEventsForDay(date)
    const uniqueTypes = new Set(events.map((event) => event.type))
    return Array.from(uniqueTypes).slice(0, 3)
  }

  const getDaysToDisplay = () => {
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
  }

  // Обработчик колесика мыши для горизонтального скролла
  const handleWheel = (e: React.WheelEvent) => {
    // Если нажат Shift или это горизонтальный скролл
    if (e.deltaX !== 0) {
      e.preventDefault()

      // Используем дебаунс для предотвращения слишком частых переключений
      if (e.deltaX > 50) {
        handleNext()
      } else if (e.deltaX < -50) {
        handlePrevious()
      }
    }
  }

  // Добавляем обработчик preventDefault для горизонтального скролла
  React.useEffect(() => {
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

  // Настраиваем обработчики свайпов для мобильных устройств
  React.useEffect(() => {
    const calendarContainer = calendarRef.current
    if (!calendarContainer) return

    const handleTouchStart = (e: TouchEvent) => {
      if (isAnimating) return

      const touch = e.touches[0]
      swipeRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      // Предотвращаем стандартное поведение только если это горизонтальный свайп
      if (swipeRef.current) {
        const touch = e.touches[0]
        const deltaX = touch.clientX - swipeRef.current.startX
        const deltaY = touch.clientY - swipeRef.current.startY

        // Если горизонтальное движение больше вертикального, предотвращаем скролл
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          e.preventDefault()
        }
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!swipeRef.current || isAnimating) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - swipeRef.current.startX
      const deltaY = touch.clientY - swipeRef.current.startY
      const deltaTime = Date.now() - swipeRef.current.startTime

      // Проверяем, что это был быстрый горизонтальный свайп
      // и вертикальное движение было минимальным
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

      swipeRef.current = null
    }

    calendarContainer.addEventListener("touchstart", handleTouchStart, { passive: true })
    calendarContainer.addEventListener("touchmove", handleTouchMove, { passive: false })
    calendarContainer.addEventListener("touchend", handleTouchEnd, { passive: true })

    return () => {
      calendarContainer.removeEventListener("touchstart", handleTouchStart)
      calendarContainer.removeEventListener("touchmove", handleTouchMove)
      calendarContainer.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isAnimating])

  const days = getDaysToDisplay()

  // Варианты анимации для календаря в стиле слайдера
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 1,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 1,
    }),
  }

  // Получаем названия дней недели
  const getDayNames = () => {
    return eachDayOfInterval({
      start: startOfWeek(new Date(), { locale: ru }),
      end: endOfWeek(new Date(), { locale: ru }),
    }).map((date) => format(date, isSmallMobile ? "EEEEE" : "EEEEEE", { locale: ru }).toUpperCase())
  }

  const dayNames = getDayNames()

  // Получаем цвет для типа события
  const getEventTypeColor = (type: Entry["type"], isSelected: boolean) => {
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
  }

  // Получаем месяц и год для отображения
  const monthYear = format(currentDate, "LLLL yyyy", { locale: ru })
  const capitalizedMonthYear = monthYear.charAt(0).toUpperCase() + monthYear.slice(1)

  // Компонент для рендеринга содержимого календаря
  const CalendarContent = React.useCallback(() => {
    return (
      <>
        {/* Недельное представление */}
        {view === "week" && (
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
                <motion.button
                  key={date.toString()}
                  onClick={() => onDateSelect(date)}
                  className={cn(
                    "flex flex-col items-center justify-start rounded-xl p-2 sm:p-3 text-center transition-all relative overflow-hidden group",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                      : isCurrentDay
                        ? "bg-primary/5 shadow-sm border border-primary/10"
                        : !isCurrentMonth
                          ? "text-muted-foreground/50"
                          : hasEvents
                            ? "hover:bg-primary/5 hover:border-primary/10 hover:shadow-sm border border-transparent"
                            : "hover:bg-accent/30",
                  )}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={isSelected ? { scale: 1.05 } : { scale: 1 }}
                  animate={isSelected ? { scale: 1.05 } : { scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {isSelected && (
                    <motion.div
                      className="absolute inset-0 bg-primary/10 z-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}

                  {hasEvents && !isSelected && (
                    <motion.div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
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
                        <motion.span
                          key={idx}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          className={cn(
                            "h-1.5 w-1.5 rounded-full shadow-[0_0_3px_rgba(0,0,0,0.1)]",
                            getEventTypeColor(type, isSelected),
                            isSelected && "shadow-[0_0_5px_rgba(255,255,255,0.5)]",
                          )}
                        />
                      ))}
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>
        )}

        {/* Месячное представление */}
        {view === "month" && (
          <div className="p-3 sm:p-4 md:p-6">
            {/* Сетка дней */}
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
                    <motion.button
                      onClick={() => onDateSelect(date)}
                      className={cn(
                        "w-full h-8 sm:h-9 flex flex-col items-center justify-center rounded-md text-center transition-all relative overflow-hidden group",
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                          : isCurrentDay
                            ? "bg-primary/5 shadow-sm border border-primary/10"
                            : !isCurrentMonth
                              ? "text-muted-foreground/40"
                              : hasEvents
                                ? "hover:bg-primary/5 hover:border-primary/10 hover:shadow-sm border border-transparent"
                                : "hover:bg-accent/30",
                      )}
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.95 }}
                      initial={isSelected ? { scale: 1.05 } : { scale: 1 }}
                      animate={isSelected ? { scale: 1.05 } : { scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isSelected && (
                        <motion.div
                          className="absolute inset-0 bg-primary/10 z-0"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}

                      {hasEvents && !isSelected && (
                        <motion.div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
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
                            <motion.span
                              key={idx}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: idx * 0.1 }}
                              className={cn(
                                "h-1 w-1 rounded-full shadow-[0_0_3px_rgba(0,0,0,0.1)]",
                                getEventTypeColor(type, isSelected),
                                isSelected && "shadow-[0_0_5px_rgba(255,255,255,0.5)]",
                              )}
                            />
                          ))}
                        </div>
                      )}
                    </motion.button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </>
    )
  }, [view, days, currentDate, selectedDate, dbTasks])

  return (
    <div
      className="w-full overflow-hidden rounded-xl bg-white dark:bg-zinc-900 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-slate-200/50 dark:border-slate-800/50"
      ref={calendarRef}
      onWheel={handleWheel}
    >
      {/* Заголовок календаря */}
      <div className="flex flex-col gap-3 p-4 sm:p-5 md:p-6 border-b border-slate-200/70 dark:border-slate-800/70 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 dark:to-transparent relative overflow-hidden">
        {/* Декоративные элементы */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl opacity-30 -translate-y-20 translate-x-20"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-3xl opacity-20 translate-y-20 -translate-x-20"></div>

        <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-zinc-800 shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)] border border-slate-200/50 dark:border-slate-700/50"
            >
              <CalendarIcon className="h-5 w-5 text-primary" />
            </motion.div>
            <div className="flex flex-col">
              <motion.h2
                key={capitalizedMonthYear}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-xl sm:text-2xl font-medium whitespace-nowrap tracking-tight"
              >
                {capitalizedMonthYear}
              </motion.h2>
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
            <div className="relative h-9 rounded-lg shadow-sm border border-slate-200/50 dark:border-slate-700/50 bg-slate-100/80 dark:bg-zinc-900/80 backdrop-blur-sm p-1 overflow-hidden">
              {/* Движущийся индикатор активного режима */}
              <motion.div
                className="absolute top-1 bottom-1 rounded-md bg-white dark:bg-zinc-800 shadow-sm z-0"
                initial={false}
                animate={{
                  x: view === "week" ? 0 : "100%",
                  width: "calc(50% - 4px)",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />

              {/* Кнопки переключения */}
              <div className="relative z-10 flex">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewChange("week")}
                  className={cn(
                    "h-7 px-4 rounded-md transition-colors duration-200 border-none shadow-none",
                    view === "week" ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Неделя
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewChange("month")}
                  className={cn(
                    "h-7 px-4 rounded-md transition-colors duration-200 border-none shadow-none",
                    view === "month" ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Месяц
                </Button>
              </div>
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-chevron-left mr-1 animate-pulse"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Свайпните для навигации
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-chevron-right ml-1 animate-pulse"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
      )}

      {/* Контейнер календаря с содержимым */}
      <div
        className="relative bg-white dark:bg-zinc-900"
        style={{
          height: contentHeight ? `${contentHeight}px` : "auto",
          transition: "height 0.3s ease-in-out",
        }}
      >
        {/* Скрытый контейнер для измерения высоты */}
        <div ref={contentRef} className="absolute opacity-0 pointer-events-none" aria-hidden="true">
          <CalendarContent />
        </div>

        <AnimatePresence initial={false} custom={direction} mode="sync" onExitComplete={() => setIsAnimating(false)}>
          <motion.div
            key={currentDate.toISOString() + view}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0 },
            }}
            className="w-full absolute left-0 right-0"
          >
            <CalendarContent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

