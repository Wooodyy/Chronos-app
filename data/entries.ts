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
    description:
      "<h2>Основные идеи</h2><p>Использовать <strong>новый фреймворк</strong> для улучшения производительности. Добавить <em>анимации</em> для лучшего UX.</p><h3>Технические детали</h3><ul><li>Интеграция с API</li><li>Оптимизация загрузки</li><li>Улучшение мобильной версии</li></ul>",
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
    description:
      "<h2>Список книг</h2><ol><li><strong>'Атомные привычки'</strong> - Джеймс Клир</li><li><em>'Думай медленно, решай быстро'</em> - Даниэль Канеман</li><li>'Мастер и Маргарита' - Михаил Булгаков</li></ol><blockquote><p>Чтение — это вот что: это способ общаться с теми, с кем вы не можете общаться напрямую.</p></blockquote>",
    date: new Date(2025, 2, 8, 20, 15),
    type: "note",
    tags: ["чтение", "саморазвитие"],
  },
]

