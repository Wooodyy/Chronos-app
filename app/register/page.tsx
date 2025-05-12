"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Eye, EyeOff } from "lucide-react"

export default function RegisterPage() {
  const [login, setLogin] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const { register, isLoading, user } = useAuth()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!login || !firstName || !email || !password || !confirmPassword) {
      setError("Пожалуйста, заполните все обязательные поля")
      return
    }

    if (password !== confirmPassword) {
      setError("Пароли не совпадают")
      return
    }

    try {
      const result = await register({
        login,
        firstName,
        lastName,
        email,
        password,
      })

      if (result.success) {
        router.push("/dashboard")
      } else {
        setError(result.message || "Ошибка при регистрации")
      }
    } catch (err) {
      setError("Произошла ошибка при регистрации")
    }
  }

  // Don't render the register form if already logged in
  if (user) {
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-secondary/20 px-3 py-4 sm:px-6 sm:py-10">
      <div className="w-full max-w-md mx-auto transform-none transition-none">
        <Card className="border-none shadow-lg overflow-hidden transform-none transition-none">
          <CardHeader className="space-y-3 text-center px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex justify-center mb-2 sm:mb-3">
              <Image
                src="/logo.png"
                alt="Chronos Logo"
                width={56}
                height={56}
                className="drop-shadow-[0_0_10px_rgba(139,92,246,0.7)] sm:w-[64px] sm:h-[64px] w-[56px] h-[56px]"
              />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold">Chronos</CardTitle>
            <CardDescription className="text-sm sm:text-base">Создайте новый аккаунт</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <CardContent className="space-y-4 px-4 sm:px-6 py-3 sm:py-4 flex-grow">
              <div className="space-y-2">
                <Label htmlFor="login" className="text-sm sm:text-base">
                  Логин <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="login"
                  placeholder="Введите логин"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  disabled={isLoading}
                  required
                  className="h-10 sm:h-12 text-sm sm:text-base py-2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm sm:text-base">
                  Имя <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="Введите имя"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isLoading}
                  required
                  className="h-10 sm:h-12 text-sm sm:text-base py-2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm sm:text-base">
                  Фамилия
                </Label>
                <Input
                  id="lastName"
                  placeholder="Введите фамилию"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isLoading}
                  className="h-10 sm:h-12 text-sm sm:text-base py-2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm sm:text-base">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Введите email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="h-10 sm:h-12 text-sm sm:text-base py-2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm sm:text-base">
                  Пароль <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Введите пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    className="pr-10 h-10 sm:h-12 text-sm sm:text-base py-2"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm sm:text-base">
                  Подтвердите пароль <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Подтвердите пароль"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    className="pr-10 h-10 sm:h-12 text-sm sm:text-base py-2"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showConfirmPassword ? "Скрыть пароль" : "Показать пароль"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-destructive mt-2">{error}</p>}
            </CardContent>
            <CardFooter className="flex flex-col space-y-3 px-4 sm:px-6 py-4 sm:py-5">
              <Button
                type="submit"
                className="w-full h-11 sm:h-12 text-sm sm:text-base py-2 shadow-[0_0_15px_rgba(139,92,246,0.5)] hover:shadow-[0_0_20px_rgba(139,92,246,0.7)] transition-shadow"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    Регистрация...
                  </>
                ) : (
                  "Зарегистрироваться"
                )}
              </Button>
              <p className="text-center text-sm sm:text-base text-muted-foreground mt-2">
                Уже есть аккаунт?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Войти
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
