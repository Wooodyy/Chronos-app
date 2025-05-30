"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff, Loader2, Sparkles, ArrowRight, Globe } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/toast-provider"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const router = useRouter()
  const { login, user } = useAuth()
  const searchParams = useSearchParams()
  const isLogout = searchParams.get("logout") === "true"
  const { toast } = useToast()
  const { language, setLanguage, t } = useLanguage()
  const logoutToastShown = useRef(false)

  const languageOptions = [
    { value: "ru", label: "Русский" },
    { value: "kz", label: "Қазақша" },
    { value: "en", label: "English" },
  ]

  useEffect(() => {
    if (user && !isLogout) {
      router.push("/dashboard")
    }

    if (isLogout && !logoutToastShown.current) {
      logoutToastShown.current = true
      try {
        setTimeout(() => {
          toast({
            title: t("auth.login.success.logout"),
            description: t("auth.login.success.logoutDesc"),
            type: "success",
            duration: 3000,
          })
        }, 100)
      } catch (error) {
        console.error("Toast error:", error)
      }
    }
  }, [user, router, isLogout, t, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!username || !password) {
      setError(t("auth.login.error.fillFields"))
      return
    }

    setIsLoggingIn(true)

    try {
      const success = await login(username, password)

      if (success) {
        router.push("/dashboard")
      } else {
        setError(t("auth.login.error.invalidCredentials"))
        try {
          toast({
            title: t("auth.login.error.invalidCredentials"),
            description: t("auth.login.error.invalidCredentials"),
            type: "error",
          })
        } catch (error) {
          console.error("Toast error:", error)
        }
      }
    } catch (err) {
      console.error("Login error:", err)
      setError(t("auth.login.error.general"))
      try {
        toast({
          title: t("auth.login.error.general"),
          description: t("auth.login.error.general"),
          type: "error",
        })
      } catch (error) {
        console.error("Toast error:", error)
      }
    } finally {
      setIsLoggingIn(false)
    }
  }

  const isUsernameLabelFloating = focusedField === "username" || username
  const isPasswordLabelFloating = focusedField === "password" || password

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900">
      {/* Language Toggle - Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all hover:bg-white/20 hover:scale-110 active:scale-90">
              <Globe className="h-5 w-5 text-white" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white/10 backdrop-blur-xl border border-white/20">
            {languageOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                className={cn(
                  "cursor-pointer text-white hover:bg-white/10",
                  language === option.value && "bg-white/20 font-medium",
                )}
                onClick={() => setLanguage(option.value as "ru" | "kz" | "en")}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 md:w-80 md:h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 md:w-2 md:h-2 bg-white/10 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-md px-4 py-0 mx-auto">
        <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl overflow-hidden">
          <CardHeader className="text-center space-y-4 px-4 py-6 sm:px-6 sm:py-6">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full blur opacity-75 animate-pulse"></div>
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center shadow-xl">
                  <Image src="/logo.png" alt="Chronos Logo" width={64} height={64} className="drop-shadow-lg" />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                {t("auth.login.title")}
              </CardTitle>
              <CardDescription className="text-white/70 text-base">{t("auth.login.subtitle")}</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-4 sm:px-6 pb-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Field */}
              <div className="relative">
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => setFocusedField(null)}
                  className="h-12 bg-white/10 border-white/20 text-white backdrop-blur-sm focus:bg-white/20 focus:border-purple-400 transition-all duration-200 text-base pt-2"
                  placeholder=""
                  autoComplete="off"
                />
                <Label
                  htmlFor="username"
                  className={`absolute left-3 transition-all duration-200 pointer-events-none ${
                    isUsernameLabelFloating
                      ? "-top-3 text-xs font-semibold text-white bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 px-2 py-1 rounded-md shadow-lg border border-purple-400/30"
                      : "top-3 text-sm text-white/70"
                  }`}
                >
                  {t("auth.login.username")}
                </Label>
              </div>

              {/* Password Field */}
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  className="h-12 bg-white/10 border-white/20 text-white backdrop-blur-sm focus:bg-white/20 focus:border-purple-400 transition-all duration-200 text-base pt-2 pr-10"
                  placeholder=""
                  autoComplete="off"
                />
                <Label
                  htmlFor="password"
                  className={`absolute left-3 transition-all duration-200 pointer-events-none ${
                    isPasswordLabelFloating
                      ? "-top-3 text-xs font-semibold text-white bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 px-2 py-1 rounded-md shadow-lg border border-purple-400/30"
                      : "top-3 text-sm text-white/70"
                  }`}
                >
                  {t("auth.login.password")}
                </Label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-2 animate-in slide-in-from-top-2">
                  <p className="text-red-200 text-xs sm:text-sm text-center">{error}</p>
                </div>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoggingIn}
                className="w-full h-10 sm:h-12 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold text-sm sm:text-base rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoggingIn ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    <span>{t("auth.login.loading")}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>{t("auth.login.button")}</span>
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="px-4 sm:px-6 py-4">
            <div className="w-full text-center space-y-3">
              <div className="flex items-center space-x-2 justify-center text-white/60">
                <div className="h-px bg-white/20 flex-1"></div>
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                <div className="h-px bg-white/20 flex-1"></div>
              </div>
              <p className="text-white/70 text-sm">
                {t("auth.login.noAccount")}{" "}
                <Link
                  href="/register"
                  className="text-purple-300 hover:text-purple-200 font-medium transition-colors hover:underline"
                >
                  {t("auth.login.register")}
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
