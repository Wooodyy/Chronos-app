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

// Переводы для меню
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
