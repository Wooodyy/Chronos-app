import type { Entry } from "@/types/entry"

export const entries: Entry[] = [
  {
    id: "3",
    title: "День рождения мамы",
    description: "Не забыть купить подарок и позвонить",
    date: new Date(2025, 2, 15, 0, 0),
    type: "reminder",
    priority: "high",
    tags: ["семья", "праздник"],
  },
  {
    id: "4",
    title: "Идеи для проекта",
    description: "Использовать новый фреймворк для улучшения производительности. Добавить анимации для лучшего UX.",
    date: new Date(2025, 2, 8, 15, 45),
    type: "note",
    tags: ["работа", "идеи"],
  },
  {
    id: "7",
    title: "Прием у врача",
    description: "Ежегодный осмотр",
    date: new Date(2025, 2, 20, 14, 30),
    type: "reminder",
    priority: "medium",
    tags: ["здоровье"],
  },
  {
    id: "8",
    title: "Книги для чтения",
    description: "1. 'Атомные привычки'\n2. 'Думай медленно, решай быстро'\n3. 'Мастер и Маргарита'",
    date: new Date(2025, 2, 8, 20, 15),
    type: "note",
    tags: ["чтение", "саморазвитие"],
  },
]

