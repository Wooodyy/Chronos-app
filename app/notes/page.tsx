"use client"

import { useState } from "react"
import { FileText, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EntriesList } from "@/components/features/entries/entries-list"
import { SearchButton } from "@/components/shared/search-button"
import { entries } from "@/data/entries"
import { useRouter } from "next/navigation"

export default function NotesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  // Фильтруем только заметки
  const notes = entries
    .filter((entry) => entry.type === "note")
    .filter(
      (entry) =>
        searchQuery === "" ||
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )

  return (
    <div className="flex flex-col min-h-full">
      {/* Mobile padding for header */}
      <div className="h-16 md:hidden" />

      <div className="flex-1 p-4 md:p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 aspect-square">
              <FileText className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Заметки</h1>
              <p className="text-sm text-muted-foreground mt-1">Управляйте своими заметками</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <SearchButton onSearch={setSearchQuery} />
            <Button onClick={() => router.push("/new/note")} className="gap-2 hidden md:flex">
              <Plus className="h-4 w-4" />
              Создать заметку
            </Button>
          </div>
        </div>

        <EntriesList entries={notes} showDate={true} />
      </div>

      {/* Mobile padding for bottom navigation */}
      <div className="h-20 md:hidden" />
    </div>
  )
}

