"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ru } from "@/locales/ru"
import { kz } from "@/locales/kz"
import { en } from "@/locales/en"

// Типы для языковых данных
type LanguageType = "ru" | "kz" | "en"

// Интерфейс для контекста языка
interface LanguageContextType {
  language: LanguageType
  setLanguage: (lang: LanguageType) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

// Создаем контекст
const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Объект переводов, импортированный из отдельных файлов
const translations = {
  ru,
  kz,
  en,
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
  const t = (key: string, params?: Record<string, string | number>): string => {
    let translation = translations[language][key as keyof (typeof translations)[typeof language]] || key

    // Если есть параметры для подстановки, заменяем их в строке перевода
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(`{${paramKey}}`, String(paramValue))
      })
    }

    return translation
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
