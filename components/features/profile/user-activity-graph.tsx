"use client"

import type React from "react"
import { useMemo } from "react"
import { format, addDays, startOfYear, endOfYear, startOfWeek, differenceInCalendarWeeks } from "date-fns"
import { ru, enUS } from "date-fns/locale"
import { useTheme } from "next-themes"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ActivityData {
  date: string // YYYY-MM-DD
  count: number
}

interface UserActivityGraphProps {
  activityData: ActivityData[]
  year: number
}

const UserActivityGraph: React.FC<UserActivityGraphProps> = ({ activityData, year }) => {
  const { t, language } = useLanguage()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const locale = useMemo(() => {
    if (language === "ru" || language === "kz") return ru
    return enUS
  }, [language])

  const contributionsMap = useMemo(() => {
    const map = new Map<string, number>()
    activityData.forEach((item) => {
      map.set(format(new Date(item.date), "yyyy-MM-dd"), item.count)
    })
    return map
  }, [activityData])

  const yearStartDate = startOfYear(new Date(year, 0, 1))
  const yearEndDate = endOfYear(new Date(year, 0, 1))
  const weekStartsOn = 0 // Sunday

  const weeks = useMemo(() => {
    const firstDayOfGrid = startOfWeek(yearStartDate, { locale, weekStartsOn })
    const numWeeks = differenceInCalendarWeeks(yearEndDate, yearStartDate, { locale, weekStartsOn }) + 1
    const calendarGrid: { date: Date; count: number; isInYear: boolean }[][] = []
    let currentDay = firstDayOfGrid
    for (let w = 0; w < numWeeks; w++) {
      const week: { date: Date; count: number; isInYear: boolean }[] = []
      for (let d = 0; d < 7; d++) {
        const dateStr = format(currentDay, "yyyy-MM-dd")
        const count = contributionsMap.get(dateStr) || 0
        const isInYear = currentDay.getFullYear() === year
        week.push({ date: new Date(currentDay.valueOf()), count, isInYear })
        currentDay = addDays(currentDay, 1)
      }
      calendarGrid.push(week)
    }
    return calendarGrid
  }, [yearStartDate, yearEndDate, contributionsMap, locale, weekStartsOn, year])

  const totalContributions = useMemo(() => activityData.reduce((sum, item) => sum + item.count, 0), [activityData])

  const getColorClass = (count: number) => {
    if (count === 0) return isDark ? "bg-zinc-700" : "bg-gray-200"
    if (count <= 2) return isDark ? "bg-purple-900/50" : "bg-purple-300/50"
    if (count <= 5) return isDark ? "bg-purple-700/70" : "bg-purple-500/70"
    if (count <= 9) return isDark ? "bg-purple-600/90" : "bg-purple-700/90"
    return isDark ? "bg-purple-500" : "bg-purple-900"
  }

  const monthDataForDisplay = useMemo(() => {
    if (!weeks.length) return []
    const monthDetails: {
      name: string
      monthIndex: number
      weeksInMonth: { date: Date; count: number; isInYear: boolean }[][]
      colSpan: number // Number of weeks this month visually occupies
    }[] = []

    let currentMonthIndex = -1
    let currentMonthWeeks: { date: Date; count: number; isInYear: boolean }[][] = []
    let firstWeekOfCurrentMonthGrid = -1

    weeks.forEach((week, weekIdx) => {
      const firstDayInWeekOfYear = week.find((d) => d.isInYear)
      if (!firstDayInWeekOfYear) {
        // This week is entirely outside the target year (e.g. padding week at start/end)
        // If we were accumulating weeks for a month, and this week is padding,
        // it means the previous month ended.
        if (currentMonthIndex !== -1 && currentMonthWeeks.length > 0) {
          monthDetails.push({
            name: format(new Date(year, currentMonthIndex, 1), "MMM", { locale }),
            monthIndex: currentMonthIndex,
            weeksInMonth: currentMonthWeeks,
            colSpan: currentMonthWeeks.length,
          })
          currentMonthWeeks = []
          currentMonthIndex = -1
        }
        return // Skip this padding week for month processing
      }

      const weekMonthIndex = firstDayInWeekOfYear.date.getMonth()

      if (currentMonthIndex === -1) {
        // Starting a new month
        currentMonthIndex = weekMonthIndex
        currentMonthWeeks.push(week)
        firstWeekOfCurrentMonthGrid = weekIdx
      } else if (weekMonthIndex === currentMonthIndex) {
        // Continuing the current month
        currentMonthWeeks.push(week)
      } else {
        // Month changed, finalize previous month
        monthDetails.push({
          name: format(new Date(year, currentMonthIndex, 1), "MMM", { locale }),
          monthIndex: currentMonthIndex,
          weeksInMonth: currentMonthWeeks,
          colSpan: currentMonthWeeks.length,
        })
        // Start new month
        currentMonthIndex = weekMonthIndex
        currentMonthWeeks = [week]
        firstWeekOfCurrentMonthGrid = weekIdx
      }
    })

    // Add the last accumulated month
    if (currentMonthIndex !== -1 && currentMonthWeeks.length > 0) {
      monthDetails.push({
        name: format(new Date(year, currentMonthIndex, 1), "MMM", { locale }),
        monthIndex: currentMonthIndex,
        weeksInMonth: currentMonthWeeks,
        colSpan: currentMonthWeeks.length,
      })
    }
    return monthDetails.filter((md) => md.colSpan > 0)
  }, [weeks, year, locale])

  const dayLabels = [
    { short: t("day.short.sun"), full: t("day.sunday") },
    { short: t("day.short.mon"), full: t("day.monday") },
    { short: t("day.short.tue"), full: t("day.tuesday") },
    { short: t("day.short.wed"), full: t("day.wednesday") },
    { short: t("day.short.thu"), full: t("day.thursday") },
    { short: t("day.short.fri"), full: t("day.friday") },
    { short: t("day.short.sat"), full: t("day.saturday") },
  ]

  const monthHeaderHeight = "1.5em"
  const monthHeaderMarginBottom = "0.25rem"

  if (!weeks.length) return <div className="p-4 text-center text-muted-foreground">{t("profile.noActivityData")}</div>

  return (
    <TooltipProvider delayDuration={100}>
      <div
        className="w-full"
        style={
          {
            "--cell-size": "13px",
            "--md-cell-size": "15px",
            "--cell-gap": "2.5px",
            "--month-gap": "8px",
          } as React.CSSProperties
        }
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold">
{t("profile.contributionsInYear", { year, total: totalContributions })}
          </h3>
        </div>

        <div className="flex">
          {/* Day Labels */}
          <div
            className="hidden md:grid grid-rows-7 gap-[var(--cell-gap)] pr-2 text-xs text-muted-foreground shrink-0"
            style={{ paddingTop: `calc(${monthHeaderHeight} + ${monthHeaderMarginBottom} + var(--cell-gap))` }}
          >
            {dayLabels.map((day, index) => (
              <div key={index} className="h-[var(--md-cell-size)] flex items-center">
                {index === 1 || index === 3 || index === 5 ? day.short : ""}
              </div>
            ))}
          </div>

          {/* Scrollable Activity Area */}
          <div className="flex-grow overflow-x-auto pb-2">
            <div className="inline-flex" style={{ gap: "var(--month-gap)" }}>
              {monthDataForDisplay.map((month) => (
                <div key={month.monthIndex} className="flex flex-col">
                  {/* Month Label */}
                  <div
                    className="text-xs text-muted-foreground text-center h-[1.5em] mb-1 pt-0.5"
                    style={{
                      width: `calc(${month.colSpan} * (var(--cell-size) + var(--cell-gap)) - var(--cell-gap))`,
                    }}
                  >
                    {month.name}
                  </div>
                  {/* Month Cell Grid */}
                  <div className="grid grid-flow-col auto-cols-[var(--cell-size)] md:auto-cols-[var(--md-cell-size)] gap-[var(--cell-gap)]">
                    {month.weeksInMonth.map((weekData, weekIndex) => (
                      <div key={weekIndex} className="grid grid-rows-7 gap-[var(--cell-gap)]">
                        {weekData.map(({ date, count, isInYear }, dayIndex) => {
                          const cellSizeClass =
                            "w-[var(--cell-size)] h-[var(--cell-size)] md:w-[var(--md-cell-size)] md:h-[var(--md-cell-size)]"
                          if (!isInYear)
                            return (
                              <div
                                key={dayIndex}
                                className={cn(cellSizeClass, "rounded-sm bg-transparent opacity-50")}
                              />
                            )
                          if (count > 0) {
                            return (
                              <Tooltip key={dayIndex}>
                                <TooltipTrigger asChild>
                                  <div
                                    className={cn(cellSizeClass, "rounded-sm cursor-pointer", getColorClass(count))}
                                  />
                                </TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  className="bg-background text-foreground border shadow-lg rounded-md px-2 py-1 text-xs"
                                >
                                  <p>
                                    <strong>
                                      {count} {t(count === 1 ? "profile.contribution" : "profile.contributions")}
                                    </strong>{" "}
                                    {t("profile.onDate")} {format(date, "PPP", { locale })}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            )
                          } else {
                            return (
                              <div key={dayIndex} className={cn(cellSizeClass, "rounded-sm", getColorClass(count))} />
                            )
                          }
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Legend */}
        <div className="flex items-center justify-end text-xs text-muted-foreground mt-2 mr-2">
          <span>{t("profile.less")}</span>
          <div className="flex gap-1 mx-2">
            {[0, 1, 3, 6, 10].map((count) => (
              <div key={count} className={cn("w-2.5 h-2.5 md:w-3 md:h-3 rounded-sm", getColorClass(count))} />
            ))}
          </div>
          <span>{t("profile.more")}</span>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default UserActivityGraph
