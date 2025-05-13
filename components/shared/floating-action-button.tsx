"use client"

import { Plus, FileText, ListTodo, Bell, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function FloatingActionButton() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  const handleItemClick = (path: string) => {
    router.push(path)
    setIsOpen(false)
  }

  const menuItems = [
    {
      icon: FileText,
      label: "Заметка",
      color: "bg-emerald-500",
      textColor: "text-emerald-500",
      path: "/new/note",
    },
    {
      icon: ListTodo,
      label: "Задача",
      color: "bg-blue-500",
      textColor: "text-blue-500",
      path: "/new/task",
    },
    {
      icon: Bell,
      label: "Напоминание",
      color: "bg-amber-500",
      textColor: "text-amber-500",
      path: "/new/reminder",
    },
  ]

  return (
    <div className="fixed bottom-20 right-6 z-50 md:hidden">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-16 right-0 flex flex-col-reverse gap-3 items-end z-50"
          >
            {menuItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-2"
              >
                <div className="glass-effect py-2 px-3 rounded-full">
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <button
                  onClick={() => handleItemClick(item.path)}
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full shadow-md",
                    item.color,
                    "text-white",
                    "shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-shadow",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/40 text-white  z-50 shadow-[0_0_18px_rgba(147,51,234,0.7)] hover:shadow-[0_0_25px_rgba(147,51,234,0.9)] transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleMenu}
      >
        <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
          {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </motion.div>
        <div className="absolute inset-0 rounded-full shadow-[0_0_15px_3px_rgba(147,51,234,0.6),inset_0_0_5px_rgba(147,51,234,0.6)]" />
      </motion.button>
    </div>
  )
}
