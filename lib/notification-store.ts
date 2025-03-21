import { create } from "zustand"
import { persist } from "zustand/middleware"

export type NotificationType = "success" | "error" | "info" | "warning"

export interface Notification {
  id: string
  message: string
  type: NotificationType
  createdAt: number
}

interface NotificationStore {
  notifications: Notification[]
  addNotification: (message: string, type: NotificationType) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      notifications: [],
      addNotification: (message, type) => {
        const id = Math.random().toString(36).substring(2, 9)
        const notification = {
          id,
          message,
          type,
          createdAt: Date.now(),
        }
        set((state) => ({
          notifications: [...state.notifications, notification],
        }))

        // Автоматически удаляем уведомление через 5 секунд
        setTimeout(() => {
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          }))
        }, 5000)
      },
      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }))
      },
      clearNotifications: () => {
        set({ notifications: [] })
      },
    }),
    {
      name: "notification-store",
    },
  ),
)

