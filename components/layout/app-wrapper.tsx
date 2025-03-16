"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { FloatingActionButton } from "@/components/shared/floating-action-button"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

const publicRoutes = ["/login", "/register"]

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const isPublicRoute = publicRoutes.includes(pathname)

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
    return <>{children}</>
  }

  // Для защищенных маршрутов с аутентифицированным пользователем
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>
      <FloatingActionButton />
    </div>
  )
}

