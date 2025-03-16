"use client"

import * as React from "react"
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
import { CalendarIcon } from "lucide-react"
import { entries } from "@/data/entries"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import type { Entry } from "@/types/entry"

interface CalendarViewProps {
  onDateSelect: (date: Date) => void
  selectedDate: Date
}

export function CalendarView({ onDateSelect, selectedDate }: CalendarViewProps) {
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

    // Добавляем слушатель изменения размера окна
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
    return entries.filter((entry) => isSameDay(entry.date, date))
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
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
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
    if (isSelected) return "bg-primary-foreground"

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

              return (
                <motion.button
                  key={date.toString()}
                  onClick={() => onDateSelect(date)}
                  className={cn(
                    "flex flex-col items-center justify-start rounded-xl p-2 sm:p-3 text-center transition-all relative",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : isCurrentDay
                        ? "bg-accent/50 shadow"
                        : !isCurrentMonth
                          ? "text-muted-foreground/50"
                          : "hover:bg-accent/30",
                  )}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={isSelected ? { scale: 1.05 } : { scale: 1 }}
                  animate={isSelected ? { scale: 1.05 } : { scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <span
                    className={cn(
                      "text-sm sm:text-base relative z-10 mb-1",
                      isSelected ? "font-bold" : isCurrentDay ? "font-semibold" : "font-medium",
                    )}
                  >
                    {dayNumber}
                  </span>

                  {eventTypes.length > 0 && (
                    <div className="flex justify-center gap-1 mt-auto">
                      {eventTypes.map((type, idx) => (
                        <motion.span
                          key={idx}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          className={cn("h-1.5 w-1.5 rounded-full", getEventTypeColor(type, isSelected))}
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

                return (
                  <div key={date.toString()} className="p-0.5">
                    <motion.button
                      onClick={() => onDateSelect(date)}
                      className={cn(
                        "w-full h-8 sm:h-9 flex flex-col items-center justify-center rounded-md text-center transition-all relative",
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-lg"
                          : isCurrentDay
                            ? "bg-accent/50 shadow"
                            : !isCurrentMonth
                              ? "text-muted-foreground/40"
                              : "hover:bg-accent/30",
                      )}
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.95 }}
                      initial={isSelected ? { scale: 1.05 } : { scale: 1 }}
                      animate={isSelected ? { scale: 1.05 } : { scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span
                        className={cn(
                          "text-xs sm:text-sm relative z-10",
                          isSelected ? "font-bold" : isCurrentDay ? "font-semibold" : "font-medium",
                        )}
                      >
                        {dayNumber}
                      </span>

                      {eventTypes.length > 0 && (
                        <div className="absolute bottom-0.5 flex justify-center gap-0.5">
                          {eventTypes.map((type, idx) => (
                            <motion.span
                              key={idx}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: idx * 0.1 }}
                              className={cn("h-1 w-1 rounded-full", getEventTypeColor(type, isSelected))}
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
  }, [view, days, currentDate, selectedDate])

  return (
    <div className="w-full overflow-hidden rounded-xl bg-card shadow-inner" ref={calendarRef} onWheel={handleWheel}>
      {/* Заголовок календаря */}
      <div className="flex flex-col gap-3 p-3 sm:p-4 md:p-6 border-b border-border/30 bg-accent-foreground/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"
            >
              <CalendarIcon className="h-5 w-5 text-primary" />
            </motion.div>
            <motion.h2
              key={capitalizedMonthYear}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-lg sm:text-xl font-medium whitespace-nowrap"
            >
              {capitalizedMonthYear}
            </motion.h2>

            {/* Показываем кнопки навигации только на десктопе */}
            {!isMobile && (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={handlePrevious} className="h-8 w-8 rounded-full">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleNext} className="h-8 w-8 rounded-full">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Переработанные кнопки управления */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg overflow-hidden shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToday}
                className={cn(
                  "h-9 px-3 rounded-none border-r border-border/30 bg-background/80 text-foreground hover:bg-background/80 hover:text-foreground",
                )}
              >
                <p className={cn("hover:text-primary ")} >Сегодня</p>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewChange("week")}
                className={cn(
                  "h-9 px-3 rounded-none border-r border-border/30 bg-background/80 text-foreground hover:bg-background/80 hover:text-foreground",
                )}
              >
                <p className={cn("hover:text-primary ", view === "week" && "text-primary",)} >Неделя</p>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewChange("month")}
                className={cn(
                  "h-9 px-3 rounded-none border-r border-border/30 bg-background/80 text-foreground hover:bg-background/80 hover:text-foreground",
                )}
              >
                <p className={cn("hover:text-primary ", view === "month" && "text-primary",)} >Месяц</p>
              </Button>
            </div>
          </div>
        </div>

        {/* Дни недели */}
        <div className="grid grid-cols-7 gap-2 text-center">
          {dayNames.map((day, index) => (
            <div key={index} className="text-xs font-semibold text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Индикатор свайпа для мобильных устройств */}
      {isMobile && (
        <div className="flex justify-center items-center py-1 text-muted-foreground text-xs">
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
        className="relative bg-muted/30"
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
              opacity: { duration: 0.2 },
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

