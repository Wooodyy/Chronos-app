"use client"

import type React from "react"
import { useState } from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface SearchButtonProps {
  onSearch: (query: string) => void
}

export function SearchButton({ onSearch }: SearchButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  const handleClear = () => {
    setSearchQuery("")
    onSearch("")
  }

  return (
    <div className="relative">
      <AnimatePresence>
        {isExpanded ? (
          <motion.form
            initial={{ width: 40, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            exit={{ width: 40, opacity: 0 }}
            className="flex items-center gap-2"
            onSubmit={handleSubmit}
          >
            <div className="relative flex-1">
              <Input
                autoFocus
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-8"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(false)}
              className="rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.form>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsExpanded(true)}
              className={cn("rounded-full", isExpanded ? "bg-accent" : "")}
            >
              <Search className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

