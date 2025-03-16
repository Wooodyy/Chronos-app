"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

export interface User {
  id: number
  login: string
  name: string
  firstName?: string
  lastName?: string
  email: string
  role?: string
  avatar?: string | null
  created_at?: Date
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<boolean>
  register: (userData: {
    login: string
    firstName: string
    lastName: string
    email: string
    password: string
  }) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  updateUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Функция для обновления данных пользователя
  const updateUserData = async () => {
    if (!user?.id) return

    try {
      const response = await fetch(`/api/users/${user.id}`)
      const data = await response.json()

      if (data.success && data.user) {
        // Убедимся, что все поля пользователя сохраняются правильно
        const updatedUser = {
          ...user,
          ...data.user,
          name: `${data.user.firstName || ""} ${data.user.lastName || ""}`.trim(),
        }
        setUser(updatedUser)
        localStorage.setItem("chronos_user", JSON.stringify(updatedUser))
        console.log("User data updated:", updatedUser) // Добавим для отладки
      }
    } catch (error) {
      console.error("Error updating user data:", error)
    }
  }

  useEffect(() => {
    // Проверяем, есть ли сохраненный пользователь в localStorage
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem("chronos_user")
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)

          // Проверяем актуальность данных пользователя из API
          if (parsedUser.id) {
            try {
              const response = await fetch(`/api/users/${parsedUser.id}`)
              const data = await response.json()

              if (data.success && data.user) {
                setUser(data.user)
              } else {
                // Если пользователь не найден в базе, очищаем localStorage
                localStorage.removeItem("chronos_user")
              }
            } catch (error) {
              console.error("Error fetching user data:", error)
              // Если API недоступно, используем данные из localStorage
              setUser(parsedUser)
            }
          }
        }
      } catch (error) {
        console.error("Error loading user from localStorage:", error)
        localStorage.removeItem("chronos_user")
      } finally {
        setIsLoading(false)
      }
    }

    // Используем setTimeout, чтобы убедиться, что код выполняется на клиенте
    if (typeof window !== "undefined") {
      loadUser()
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ login: username, password }),
      })

      const data = await response.json()

      if (data.success && data.user) {
        localStorage.setItem("chronos_user", JSON.stringify(data.user))
        setUser(data.user)
        return true
      }

      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: {
    login: string
    firstName: string
    lastName: string
    email: string
    password: string
  }): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (data.success && data.user) {
        localStorage.setItem("chronos_user", JSON.stringify(data.user))
        setUser(data.user)
      }

      return {
        success: data.success,
        message: data.message,
      }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, message: "Произошла ошибка при регистрации" }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("chronos_user")
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUserData }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth должен использоваться внутри AuthProvider")
  }
  return context
}

