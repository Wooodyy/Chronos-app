import type { Entry } from "@/types/entry"

export const entries: Entry[] = [
  {
    id: "3",
    title: "День рождения мамы",
    description: "Не забыть купить подарок и позвонить",
    date: new Date(2025, 3, 15, 0, 0),
    type: "reminder",
    priority: "high",
    tags: ["семья", "праздник"],
  },
  {
    id: "7",
    title: "Прием у врача",
    description: "Ежегодный осмотр",
    date: new Date(2025, 3, 20, 14, 30),
    type: "reminder",
    priority: "medium",
    tags: ["здоровье"],
  },
]

