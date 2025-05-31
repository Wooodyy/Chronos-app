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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Loader2, Eye, EyeOff, Sparkles, UserPlus, Globe } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"

export default function RegisterPage() {
  const [login, setLogin] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const { register, isLoading, user } = useAuth()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { language, setLanguage, t } = useLanguage()

  const languageOptions = [
    { value: "ru", label: "Русский" },
    { value: "kz", label: "Қазақша" },
    { value: "en", label: "English" },
  ]

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!login || !firstName || !email || !password || !confirmPassword) {
      setError(t("auth.register.error.fillRequired"))
      return
    }

    if (password !== confirmPassword) {
      setError(t("auth.register.error.passwordMismatch"))
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
        setError(result.message || t("auth.register.error.general"))
      }
    } catch (err) {
      setError(t("auth.register.error.general"))
    }
  }

  if (user) {
    return null
  }

  const isLoginLabelFloating = focusedField === "login" || login
  const isFirstNameLabelFloating = focusedField === "firstName" || firstName
  const isLastNameLabelFloating = focusedField === "lastName" || lastName
  const isEmailLabelFloating = focusedField === "email" || email
  const isPasswordLabelFloating = focusedField === "password" || password
  const isConfirmPasswordLabelFloating = focusedField === "confirmPassword" || confirmPassword

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900">
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
        <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-80 md:h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 md:w-64 md:h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
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
          <CardHeader className="text-center space-y-3 px-4 py-4 sm:px-6 sm:py-5">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full blur opacity-75 animate-pulse"></div>
                  <div className="relative w-20 h-20 sm:w-22 sm:h-22 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-xl">
                    <Image
                      src="/logo.svg"
                      alt="Chronos Logo"
                      width={60}
                      height={60}
                      className="drop-shadow-lg rounded-full"
                    />
                  </div>
              </div>
            </div>

            <div className="space-y-1">
              <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
                {t("auth.register.title")}
              </CardTitle>
              <CardDescription className="text-white/70 text-sm sm:text-base">
                {t("auth.register.subtitle")}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-4 sm:px-6 pb-2 sm:pb-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Login Field */}
              <div className="relative">
                <Input
                  id="login"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  onFocus={() => setFocusedField("login")}
                  onBlur={() => setFocusedField(null)}
                  disabled={isLoading}
                  required
                  className="h-10 bg-white/10 border-white/20 text-white backdrop-blur-sm focus:bg-white/20 focus:border-emerald-400 transition-all duration-200 text-sm pt-2"
                  placeholder=""
                  autoComplete="off"
                />
                <Label
                  htmlFor="login"
                  className={`absolute left-3 transition-all duration-200 pointer-events-none ${
                    isLoginLabelFloating
                      ? "-top-3 text-xs font-semibold text-white bg-gradient-to-r from-emerald-900 via-teal-800 to-cyan-900 px-2 py-1 rounded-md shadow-lg border border-emerald-400/30"
                      : "top-2 text-sm text-white/70"
                  }`}
                >
                  {t("auth.register.login")} {t("auth.register.required")}
                </Label>
              </div>

              {/* First Name Field */}
              <div className="relative">
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onFocus={() => setFocusedField("firstName")}
                  onBlur={() => setFocusedField(null)}
                  disabled={isLoading}
                  required
                  className="h-10 bg-white/10 border-white/20 text-white backdrop-blur-sm focus:bg-white/20 focus:border-emerald-400 transition-all duration-200 text-sm pt-2"
                  placeholder=""
                  autoComplete="off"
                />
                <Label
                  htmlFor="firstName"
                  className={`absolute left-3 transition-all duration-200 pointer-events-none ${
                    isFirstNameLabelFloating
                      ? "-top-3 text-xs font-semibold text-white bg-gradient-to-r from-emerald-900 via-teal-800 to-cyan-900 px-2 py-1 rounded-md shadow-lg border border-emerald-400/30"
                      : "top-2 text-sm text-white/70"
                  }`}
                >
                  {t("auth.register.firstName")} {t("auth.register.required")}
                </Label>
              </div>

              {/* Last Name Field */}
              <div className="relative">
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onFocus={() => setFocusedField("lastName")}
                  onBlur={() => setFocusedField(null)}
                  disabled={isLoading}
                  className="h-10 bg-white/10 border-white/20 text-white backdrop-blur-sm focus:bg-white/20 focus:border-emerald-400 transition-all duration-200 text-sm pt-2"
                  placeholder=""
                  autoComplete="off"
                />
                <Label
                  htmlFor="lastName"
                  className={`absolute left-3 transition-all duration-200 pointer-events-none ${
                    isLastNameLabelFloating
                      ? "-top-3 text-xs font-semibold text-white bg-gradient-to-r from-emerald-900 via-teal-800 to-cyan-900 px-2 py-1 rounded-md shadow-lg border border-emerald-400/30"
                      : "top-2 text-sm text-white/70"
                  }`}
                >
                  {t("auth.register.lastName")}
                </Label>
              </div>

              {/* Email Field */}
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  disabled={isLoading}
                  required
                  className="h-10 bg-white/10 border-white/20 text-white backdrop-blur-sm focus:bg-white/20 focus:border-emerald-400 transition-all duration-200 text-sm pt-2"
                  placeholder=""
                  autoComplete="off"
                />
                <Label
                  htmlFor="email"
                  className={`absolute left-3 transition-all duration-200 pointer-events-none ${
                    isEmailLabelFloating
                      ? "-top-3 text-xs font-semibold text-white bg-gradient-to-r from-emerald-900 via-teal-800 to-cyan-900 px-2 py-1 rounded-md shadow-lg border border-emerald-400/30"
                      : "top-2 text-sm text-white/70"
                  }`}
                >
                  {t("auth.register.email")} {t("auth.register.required")}
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
                  disabled={isLoading}
                  required
                  className="h-10 bg-white/10 border-white/20 text-white backdrop-blur-sm focus:bg-white/20 focus:border-emerald-400 transition-all duration-200 text-sm pt-2 pr-10"
                  placeholder=""
                  autoComplete="off"
                />
                <Label
                  htmlFor="password"
                  className={`absolute left-3 transition-all duration-200 pointer-events-none ${
                    isPasswordLabelFloating
                      ? "-top-3 text-xs font-semibold text-white bg-gradient-to-r from-emerald-900 via-teal-800 to-cyan-900 px-2 py-1 rounded-md shadow-lg border border-emerald-400/30"
                      : "top-2 text-sm text-white/70"
                  }`}
                >
                  {t("auth.register.password")} {t("auth.register.required")}
                </Label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Confirm Password Field */}
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocusedField("confirmPassword")}
                  onBlur={() => setFocusedField(null)}
                  disabled={isLoading}
                  required
                  className="h-10 bg-white/10 border-white/20 text-white backdrop-blur-sm focus:bg-white/20 focus:border-emerald-400 transition-all duration-200 text-sm pt-2 pr-10"
                  placeholder=""
                  autoComplete="off"
                />
                <Label
                  htmlFor="confirmPassword"
                  className={`absolute left-3 transition-all duration-200 pointer-events-none ${
                    isConfirmPasswordLabelFloating
                      ? "-top-3 text-xs font-semibold text-white bg-gradient-to-r from-emerald-900 via-teal-800 to-cyan-900 px-2 py-1 rounded-md shadow-lg border border-emerald-400/30"
                      : "top-2 text-sm text-white/70"
                  }`}
                >
                  {t("auth.register.confirmPassword")} {t("auth.register.required")}
                </Label>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-2 animate-in slide-in-from-top-2">
                  <p className="text-red-200 text-xs text-center">{error}</p>
                </div>
              )}

              {/* Register Button */}
              <Button
                type="submit"
                className="w-full h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold text-sm rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-4"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t("auth.register.loading")}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <UserPlus className="h-4 w-4" />
                    <span>{t("auth.register.button")}</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="px-4 sm:px-6 py-3 sm:py-4">
            <div className="w-full text-center space-y-2">
              <div className="flex items-center space-x-2 justify-center text-white/60">
                <div className="h-px bg-white/20 flex-1"></div>
                <Sparkles className="h-3 w-3" />
                <div className="h-px bg-white/20 flex-1"></div>
              </div>
              <p className="text-white/70 text-xs sm:text-sm">
                {t("auth.register.hasAccount")}{" "}
                <Link
                  href="/login"
                  className="text-emerald-300 hover:text-emerald-200 font-medium transition-colors hover:underline"
                >
                  {t("auth.register.loginLink")}
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
