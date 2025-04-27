export type EntryType = "task" | "reminder" | "note"
export type PriorityLevel = "low" | "medium" | "high"
export type RepeatType = "none" | "daily" | "weekly" | "monthly"

export interface Entry {
  id: string
  title: string
  description: string
  date: Date
  type: EntryType
  completed?: boolean
  priority?: PriorityLevel
  tags?: string[]
  time?: string
  repeat_type?: RepeatType
  repeat_days?: number[]
  repeat_until?: Date
}
