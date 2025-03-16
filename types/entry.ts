export type EntryType = "task" | "reminder" | "note"
export type PriorityLevel = "low" | "medium" | "high"

export interface Entry {
  id: string
  title: string
  description: string
  date: Date
  type: EntryType
  completed?: boolean
  priority?: PriorityLevel
  tags?: string[]
}

