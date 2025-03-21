"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { FloatingActionButton } from "@/components/shared/floating-action-button"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"
import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { NotificationProvider } from "@/components/ui/notification"

const publicRoutes = ["/login", "/register"]

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading, refreshData } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const prevPathRef = useRef<string | null>(null)
  const isFirstRenderRef = useRef(true)
  const isPublicRoute = publicRoutes.includes(pathname)

  // Обработчик изменения маршрута и перезагрузки страницы
  useEffect(() => {
    // Проверяем, была ли страница перезагружена
    const handlePageLoad = async () => {
      // Если это первый рендер и пользователь авторизован, обновляем данные
      if (isFirstRenderRef.current && user && !isPublicRoute) {
        isFirstRenderRef.current = false

        // Устанавливаем флаг в sessionStorage, чтобы определить перезагрузку страницы
        const wasReloaded = sessionStorage.getItem("page_reloaded") === "true"
        sessionStorage.removeItem("page_reloaded")

        if (wasReloaded) {
          // Если страница была перезагружена, обновляем данные
          await refreshData()
        }
      }
    }

    handlePageLoad()

    // Устанавливаем обработчик события beforeunload для определения перезагрузки страницы
    const handleBeforeUnload = () => {
      sessionStorage.setItem("page_reloaded", "true")
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [user, isPublicRoute, refreshData])

  // Обработчик изменения маршрута
  useEffect(() => {
    // Если маршрут изменился и это не первый рендер, обновляем данные
    if (prevPathRef.current !== null && prevPathRef.current !== pathname && user && !isPublicRoute) {
      refreshData()
    }

    // Сохраняем текущий маршрут для следующего сравнения
    prevPathRef.current = pathname
  }, [pathname, user, isPublicRoute, refreshData])

  // Перенаправляем неаутентифицированных пользователей на страницу входа
  useEffect(() => {
    if (!isLoading && !user && !isPublicRoute) {
      router.push("/login")
    }
  }, [isLoading, user, isPublicRoute, router])

  // Показываем загрузку, пока проверяем аутентификацию
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Для публичных маршрутов или если пользователь не аутентифицирован
  if (isPublicRoute || !user) {
    return <NotificationProvider>{children}</NotificationProvider>
  }

  // Для защищенных маршрутов с аутентифицированным пользователем
  return (
    <NotificationProvider>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>
        <FloatingActionButton />
      </div>
    </NotificationProvider>
  )
}

