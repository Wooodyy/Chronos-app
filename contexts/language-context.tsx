"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Типы для языковых данных
type LanguageType = "ru" | "kz" | "en"

// Интерфейс для контекста языка
interface LanguageContextType {
  language: LanguageType
  setLanguage: (lang: LanguageType) => void
  t: (key: string) => string
}

// Создаем контекст
const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Расширим объект переводов, добавив все необходимые строки для страницы календаря
const translations = {
  ru: {
    // Sidebar items
    "menu.calendar": "Календарь",
    "menu.reminders": "Напоминания",
    "menu.notes": "Заметки",
    "menu.profile": "Профиль",
    "menu.voice": "Голосовой ввод",

    // Mobile FAB items
    "fab.note": "Заметка",
    "fab.task": "Задача",
    "fab.reminder": "Напоминание",

    // Calendar
    "calendar.weekView": "Недельный просмотр",
    "calendar.monthView": "Месячный просмотр",
    "calendar.today": "Сегодня",
    "calendar.week": "Неделя",
    "calendar.month": "Месяц",
    "calendar.swipeToNavigate": "Свайпните для навигации",

    // Dashboard page
    "dashboard.title": "Календарь",
    "dashboard.welcome": "Добро пожаловать",
    "dashboard.all": "Все",
    "dashboard.tasks": "Задачи",
    "dashboard.reminders": "Напоминания",
    "dashboard.notes": "Заметки",
    "dashboard.eventsFor": "События на",

    // Events count
    "events.count.one": "событие",
    "events.count.few": "события",
    "events.count.many": "событий",

    // Empty state
    "events.empty.title": "Событий не найдено",
    "events.empty.description": 'На выбранную дату нет событий. Создайте новое событие, нажав на кнопку "Создать".',
    "events.create": "Создать",

    // Months
    "month.january": "январь",
    "month.february": "февраль",
    "month.march": "март",
    "month.april": "апрель",
    "month.may": "май",
    "month.june": "июнь",
    "month.july": "июль",
    "month.august": "август",
    "month.september": "сентябрь",
    "month.october": "октябрь",
    "month.november": "ноябрь",
    "month.december": "декабрь",

    // Days of week
    "day.monday": "Пн",
    "day.tuesday": "Вт",
    "day.wednesday": "Ср",
    "day.thursday": "Чт",
    "day.friday": "Пт",
    "day.saturday": "Сб",
    "day.sunday": "Вс",

    // Short days
    "day.short.monday": "П",
    "day.short.tuesday": "В",
    "day.short.wednesday": "С",
    "day.short.thursday": "Ч",
    "day.short.friday": "П",
    "day.short.saturday": "С",
    "day.short.sunday": "В",
  },
  kz: {
    "menu.calendar": "Күнтізбе",
    "menu.reminders": "Еске салғыштар",
    "menu.notes": "Жазбалар",
    "menu.profile": "Профиль",
    "menu.voice": "Дауыспен енгізу",

    "fab.note": "Жазба",
    "fab.task": "Тапсырма",
    "fab.reminder": "Еске салғыш",

    // Calendar
    "calendar.weekView": "Апталық көрініс",
    "calendar.monthView": "Айлық көрініс",
    "calendar.today": "Бүгін",
    "calendar.week": "Апта",
    "calendar.month": "Ай",
    "calendar.swipeToNavigate": "Навигация үшін сырғытыңыз",

    // Dashboard page
    "dashboard.title": "Күнтізбе",
    "dashboard.welcome": "Қош келдіңіз",
    "dashboard.all": "Барлығы",
    "dashboard.tasks": "Тапсырмалар",
    "dashboard.reminders": "Еске салғыштар",
    "dashboard.notes": "Жазбалар",
    "dashboard.eventsFor": "Оқиғалар",

    // Events count
    "events.count.one": "оқиға",
    "events.count.few": "оқиға",
    "events.count.many": "оқиға",

    // Empty state
    "events.empty.title": "Оқиғалар табылмады",
    "events.empty.description": 'Таңдалған күнге оқиғалар жоқ. "Жасау" түймесін басу арқылы жаңа оқиға жасаңыз.',
    "events.create": "Жасау",

    // Months
    "month.january": "қаңтар",
    "month.february": "ақпан",
    "month.march": "наурыз",
    "month.april": "сәуір",
    "month.may": "мамыр",
    "month.june": "маусым",
    "month.july": "шілде",
    "month.august": "тамыз",
    "month.september": "қыркүйек",
    "month.october": "қазан",
    "month.november": "қараша",
    "month.december": "желтоқсан",

    // Days of week
    "day.monday": "Дс",
    "day.tuesday": "Сс",
    "day.wednesday": "Ср",
    "day.thursday": "Бс",
    "day.friday": "Жм",
    "day.saturday": "Сб",
    "day.sunday": "Жк",

    // Short days
    "day.short.monday": "Д",
    "day.short.tuesday": "С",
    "day.short.wednesday": "С",
    "day.short.thursday": "Б",
    "day.short.friday": "Ж",
    "day.short.saturday": "С",
    "day.short.sunday": "Ж",
  },
  en: {
    "menu.calendar": "Calendar",
    "menu.reminders": "Reminders",
    "menu.notes": "Notes",
    "menu.profile": "Profile",
    "menu.voice": "Voice Input",

    "fab.note": "Note",
    "fab.task": "Task",
    "fab.reminder": "Reminder",

    // Calendar
    "calendar.weekView": "Week View",
    "calendar.monthView": "Month View",
    "calendar.today": "Today",
    "calendar.week": "Week",
    "calendar.month": "Month",
    "calendar.swipeToNavigate": "Swipe to navigate",

    // Dashboard page
    "dashboard.title": "Calendar",
    "dashboard.welcome": "Welcome",
    "dashboard.all": "All",
    "dashboard.tasks": "Tasks",
    "dashboard.reminders": "Reminders",
    "dashboard.notes": "Notes",
    "dashboard.eventsFor": "Events for",

    // Events count
    "events.count.one": "event",
    "events.count.few": "events",
    "events.count.many": "events",

    // Empty state
    "events.empty.title": "No events found",
    "events.empty.description":
      'There are no events for the selected date. Create a new event by clicking the "Create" button.',
    "events.create": "Create",

    // Months
    "month.january": "January",
    "month.february": "February",
    "month.march": "March",
    "month.april": "April",
    "month.may": "May",
    "month.june": "June",
    "month.july": "July",
    "month.august": "August",
    "month.september": "September",
    "month.october": "October",
    "month.november": "November",
    "month.december": "December",

    // Days of week
    "day.monday": "Mon",
    "day.tuesday": "Tue",
    "day.wednesday": "Wed",
    "day.thursday": "Thu",
    "day.friday": "Fri",
    "day.saturday": "Sat",
    "day.sunday": "Sun",

    // Short days
    "day.short.monday": "M",
    "day.short.tuesday": "T",
    "day.short.wednesday": "W",
    "day.short.thursday": "T",
    "day.short.friday": "F",
    "day.short.saturday": "S",
    "day.short.sunday": "S",
  },
}

// Провайдер языка
export function LanguageProvider({ children }: { children: ReactNode }) {
  // Инициализируем язык из localStorage или используем русский по умолчанию
  const [language, setLanguageState] = useState<LanguageType>("ru")

  // Загружаем сохраненный язык при первом рендере
  useEffect(() => {
    const savedLanguage = localStorage.getItem("app-language") as LanguageType
    if (savedLanguage && ["ru", "kz", "en"].includes(savedLanguage)) {
      setLanguageState(savedLanguage)
    }
  }, [])

  // Функция для изменения языка
  const setLanguage = (lang: LanguageType) => {
    setLanguageState(lang)
    localStorage.setItem("app-language", lang)
  }

  // Функция для получения перевода
  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key
  }

  // Слушаем событие изменения языка
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent<LanguageType>) => {
      setLanguage(event.detail)
    }

    window.addEventListener("changeLanguage", handleLanguageChange as EventListener)

    return () => {
      window.removeEventListener("changeLanguage", handleLanguageChange as EventListener)
    }
  }, [])

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

// Хук для использования языка
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage должен использоваться внутри LanguageProvider")
  }
  return context
}
