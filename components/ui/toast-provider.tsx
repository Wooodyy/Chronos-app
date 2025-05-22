"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type ToastType = "success" | "error" | "warning" | "info"

interface ToastProps {
  id: string
  title: string
  description?: string
  type: ToastType
  duration?: number // Добавляем свойство duration в интерфейс
}

interface ToastContextType {
  toast: (props: Omit<ToastProps, "id">) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = (props: Omit<ToastProps, "id">) => {
    // Временно отключаем добавление тостов
    // const id = Math.random().toString(36).substring(2, 9)
    // const newToast = { ...props, id }
    // setToasts((prev) => [...prev, newToast])
    console.log("Toast disabled:", props.title, props.description)

    // Автоматически удаляем уведомление через заданное время или через 5 секунд по умолчанию
    // const duration = props.duration || 5000
    // setTimeout(() => {
    //   setToasts((prev) => prev.filter((t) => t.id !== id))
    // }, duration)
  }

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {/* Временно отключаем отображение тостов */}
      {/* <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Toast
                className={`${
                  t.type === "success"
                    ? "bg-success text-success-foreground"
                    : t.type === "error"
                      ? "bg-destructive text-destructive-foreground"
                      : t.type === "warning"
                        ? "bg-warning text-warning-foreground"
                        : t.type === "info"
                          ? "bg-primary text-primary-foreground"
                          : ""
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="font-medium">{t.title}</div>
                    {t.description && <div className="text-sm opacity-90">{t.description}</div>}
                  </div>
                  <button
                    onClick={() => dismiss(t.id)}
                    className="rounded-full p-1 hover:bg-black/10 dark:hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </Toast>
            </motion.div>
          ))}
        </AnimatePresence>
      </div> */}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
