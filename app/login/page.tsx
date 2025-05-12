"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { useEffect } from "react"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { login, user } = useAuth()
  const searchParams = useSearchParams()
  const isLogout = searchParams.get("logout") === "true"

  useEffect(() => {
    // Если пользователь уже авторизован и это не страница выхода, перенаправляем на главную
    if (user && !isLogout) {
      router.push("/dashboard")
    }
  }, [user, router, isLogout])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!username || !password) {
      setError("Пожалуйста, заполните все поля")
      return
    }

    setIsLoggingIn(true)

    try {
      const success = await login(username, password)

      if (success) {
        router.push("/dashboard")
      } else {
        setError("Неверный логин или пароль")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Произошла ошибка при входе")
    } finally {
      setIsLoggingIn(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-secondary/20 px-3 sm:px-6 py-4 sm:py-10">
      <div className="w-full max-w-md mx-auto transform-none transition-none">
        <Card className="border-none shadow-lg overflow-hidden transform-none transition-none">
          <CardHeader className="space-y-3 text-center px-4 sm:px-6 py-4 sm:py-5">
            <div className="flex justify-center mb-2">
              <div className="relative w-[56px] h-[56px] sm:w-[64px] sm:h-[64px]">
                <Image
                  src="/logo.png"
                  alt="Chronos Logo"
                  fill
                  className="drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                />
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold">Вход в аккаунт</CardTitle>
            <CardDescription className="text-sm sm:text-base">Введите свои данные для входа в систему</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6 py-0 sm:py-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm sm:text-base">
                  Логин
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Введите логин"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-10 sm:h-12 py-2 text-sm sm:text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm sm:text-base">
                  Пароль
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Введите пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 sm:h-12 py-2 pr-10 text-sm sm:text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
              <Button
                type="submit"
                className="w-full h-11 sm:h-12 py-2 text-sm sm:text-base shadow-[0_0_15px_rgba(139,92,246,0.5)] hover:shadow-[0_0_20px_rgba(139,92,246,0.7)] transition-shadow"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    Вход...
                  </>
                ) : (
                  "Войти"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3 text-center px-4 sm:px-6 py-4 sm:py-5">
            <p className="text-sm sm:text-base text-muted-foreground">
              Еще нет аккаунта?{" "}
              <a href="/register" className="text-primary hover:underline">
                Зарегистрироваться
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
