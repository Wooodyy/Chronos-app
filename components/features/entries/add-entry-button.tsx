"use client"

import { useState } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Plus, FileText, ListTodo, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export function AddEntryButton() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useLanguage()

  return (
    <div className="hidden md:block relative z-50">
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

      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            className="gap-2 relative z-50"
            style={{
              boxShadow: "0 0 15px rgba(147, 51, 234, 0.5)",
            }}
          >
            <Plus className="h-4 w-4" />
            {t("addEntry.create")}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 z-50">
          <DropdownMenuItem
            onClick={() => {
              router.push("/new/note")
              setIsOpen(false)
            }}
            className="flex items-center gap-2 py-2 cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 aspect-square">
              <FileText className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="flex flex-col">
              <span>{t("fab.note")}</span>
              <span className="text-xs text-muted-foreground">{t("addEntry.newNote")}</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              router.push("/new/task")
              setIsOpen(false)
            }}
            className="flex items-center gap-2 py-2 cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 aspect-square">
              <ListTodo className="h-4 w-4 text-blue-500" />
            </div>
            <div className="flex flex-col">
              <span>{t("fab.task")}</span>
              <span className="text-xs text-muted-foreground">{t("addEntry.newTask")}</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              router.push("/new/reminder")
              setIsOpen(false)
            }}
            className="flex items-center gap-2 py-2 cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 aspect-square">
              <Bell className="h-4 w-4 text-amber-500" />
            </div>
            <div className="flex flex-col">
              <span>{t("fab.reminder")}</span>
              <span className="text-xs text-muted-foreground">{t("addEntry.newReminder")}</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
