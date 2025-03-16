"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false)

  // Предотвращаем проблемы с гидратацией
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <NextThemesProvider {...props}>
      {mounted ? children : <div style={{ visibility: "hidden" }}>{children}</div>}
    </NextThemesProvider>
  )
}

// Создаем контекст и хук для удобного доступа к теме
export const ThemeContext = createContext({ theme: "", setTheme: (theme: string) => {} })

export const useTheme = () => {
  return useContext(ThemeContext)
}

