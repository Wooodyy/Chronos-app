"use client"

import type React from "react"
import { createContext, useContext, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { useNotificationStore, type NotificationType } from "@/lib/notification-store"

interface NotificationContextType {
  showNotification: (message: string, type: NotificationType) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  return context
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { notifications, addNotification, removeNotification } = useNotificationStore()

  const showNotification = useCallback(
    (message: string, type: NotificationType) => {
      addNotification(message, type)
    },
    [addNotification],
  )

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-md">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`flex items-center justify-between p-4 rounded-lg shadow-md ${
                notification.type === "success"
                  ? "bg-success/90 text-success-foreground"
                  : notification.type === "error"
                    ? "bg-destructive/90 text-destructive-foreground"
                    : notification.type === "warning"
                      ? "bg-warning/90 text-warning-foreground"
                      : "bg-primary/90 text-primary-foreground"
              }`}
            >
              <div className="flex items-center gap-3">
                {notification.type === "success" ? (
                  <CheckCircle className="h-5 w-5" />
                ) : notification.type === "error" ? (
                  <AlertCircle className="h-5 w-5" />
                ) : notification.type === "warning" ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <Info className="h-5 w-5" />
                )}
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="ml-4 hover:opacity-70 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  )
}

