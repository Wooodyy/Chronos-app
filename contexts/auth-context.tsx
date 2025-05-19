"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback, useRef } from "react"
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
  refreshData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const isUpdatingRef = useRef(false)
  const initialLoadDoneRef = useRef(false)
  const dataLoadedInSessionRef = useRef(false)

  // Функция для полной очистки всех данных из хранилищ
  const clearAllStorageData = () => {
    // Очищаем localStorage
    localStorage.removeItem("chronos_user")

    // Очищаем sessionStorage
    sessionStorage.removeItem("user_data_refreshed")
    sessionStorage.removeItem("sidebar_refreshed")
    sessionStorage.removeItem("reminders_loaded")
    sessionStorage.removeItem("page_reloaded")
    sessionStorage.removeItem("user_data_loaded")

    // Очищаем все другие ключи, связанные с приложением
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("chronos_")) {
        localStorage.removeItem(key)
      }
    }

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && (key.includes("refreshed") || key.includes("loaded") || key.includes("chronos"))) {
        sessionStorage.removeItem(key)
      }
    }
  }

  // Функция для обновления данных пользователя из API
  const updateUserData = useCallback(async () => {
    if (!user?.id || isUpdatingRef.current) return

    try {
      isUpdatingRef.current = true
      // Добавляем параметр для предотвращения кэширования
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/users/${user.id}?t=${timestamp}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })
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
      }
    } catch (error) {
      console.error("Error updating user data:", error)
    } finally {
      isUpdatingRef.current = false
    }
  }, [user])

  // Функция для полного обновления данных (используется при навигации и перезагрузке)
  const refreshData = useCallback(async () => {
    if (!user?.id || isUpdatingRef.current) return

    // Проверяем, были ли уже загружены данные в текущей сессии
    if (dataLoadedInSessionRef.current) {
      console.log("Data already loaded in this session, skipping refresh")
      return
    }

    try {
      isUpdatingRef.current = true
      await updateUserData()
      // Устанавливаем флаг, что данные были загружены в текущей сессии
      dataLoadedInSessionRef.current = true
    } catch (error) {
      console.error("Error refreshing data:", error)
    } finally {
      isUpdatingRef.current = false
    }
  }, [user, updateUserData])

  useEffect(() => {
    // Проверяем, есть ли сохраненный пользователь в localStorage
    const loadUser = async () => {
      if (initialLoadDoneRef.current) return

      // Проверяем, были ли уже загружены данные в текущей сессии
      const dataLoadedInSession = sessionStorage.getItem("user_data_loaded") === "true"
      if (dataLoadedInSession) {
        dataLoadedInSessionRef.current = true
        console.log("User data already loaded in this session")
      }

      try {
        // Проверяем, был ли выполнен выход из системы
        const logoutFlag = sessionStorage.getItem("force_logout")
        if (logoutFlag === "true") {
          // Если был выход, не загружаем пользователя
          console.log("Force logout detected, not loading user data")
          sessionStorage.removeItem("force_logout")
          setIsLoading(false)
          initialLoadDoneRef.current = true
          return
        }

        const storedUser = localStorage.getItem("chronos_user")
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)

          // Проверяем, была ли страница перезагружена
          const wasReloaded = sessionStorage.getItem("page_reloaded") === "true"
          sessionStorage.removeItem("page_reloaded")

          // Обновляем данные только при перезагрузке страницы
          if (wasReloaded && parsedUser.id && !isUpdatingRef.current) {
            // Используем setTimeout, чтобы избежать циклических обновлений
            setTimeout(async () => {
              try {
                isUpdatingRef.current = true
                const timestamp = new Date().getTime()
                const response = await fetch(`/api/users/${parsedUser.id}?t=${timestamp}`, {
                  cache: "no-store",
                  headers: {
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    Pragma: "no-cache",
                    Expires: "0",
                  },
                })
                const data = await response.json()

                if (data.success && data.user) {
                  const freshUser = {
                    ...parsedUser,
                    ...data.user,
                    name: `${data.user.firstName || ""} ${data.user.lastName || ""}`.trim(),
                  }
                  setUser(freshUser)
                  localStorage.setItem("chronos_user", JSON.stringify(freshUser))
                } else {
                  clearAllStorageData()
                  setUser(null)
                }
              } catch (error) {
                console.error("Error fetching user data:", error)
              } finally {
                isUpdatingRef.current = false
              }
            }, 100)
          }
        }
      } catch (error) {
        console.error("Error loading user from localStorage:", error)
        clearAllStorageData()
        setUser(null)
      } finally {
        setIsLoading(false)
        initialLoadDoneRef.current = true
        // Устанавливаем флаг в sessionStorage
        sessionStorage.setItem("user_data_loaded", "true")
      }
    }

    // Используем setTimeout, чтобы убедиться, что код выполняется на клиенте
    if (typeof window !== "undefined") {
      loadUser()
    } else {
      setIsLoading(false)
    }

    // Устанавливаем обработчик события beforeunload для определения перезагрузки страницы
    const handleBeforeUnload = () => {
      sessionStorage.setItem("page_reloaded", "true")
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
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
        // Удаляем флаг принудительного выхода при успешном входе
        sessionStorage.removeItem("force_logout")
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
        // Удаляем флаг принудительного выхода при успешной регистрации
        sessionStorage.removeItem("force_logout")
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
    // Устанавливаем флаг принудительного выхода
    sessionStorage.setItem("force_logout", "true")

    // Полностью очищаем все данные из хранилищ
    clearAllStorageData()

    // Очищаем все куки, связанные с аутентификацией
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })

    // Сбрасываем флаги
    dataLoadedInSessionRef.current = false
    initialLoadDoneRef.current = false

    // Сбрасываем состояние пользователя
    setUser(null)

    // Добавляем небольшую задержку перед перенаправлением, чтобы убедиться, что все данные очищены
    setTimeout(() => {
      // Перенаправляем на страницу входа с параметром, предотвращающим автоматический вход
      router.push("/login?logout=true")
    }, 100)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateUserData,
        refreshData,
      }}
    >
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
