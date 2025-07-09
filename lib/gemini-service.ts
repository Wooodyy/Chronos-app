// lib/gemini-service.ts

const GEMINI_API_KEY = "AIzaSyBszu-2IUknOTq0HmdKnw-pQCK7veJKoek" // ЗАМЕНИТЕ ЭТО!
const GEMINI_MODEL_NAME = "gemini-2.5-flash"
const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"

function getCurrentDateFormatted(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function constructPrompt(transcript: string, currentDate: string): string {
  return `
You are an intelligent assistant that helps users create tasks, reminders, or notes based on their voice input in Russian.
Your goal is to analyze the user's Russian text and determine:
1. The type of entry: "task", "reminder", or "note".
2. The relevant data for that entry type, extracted from the text.
3. Provide a user-friendly explanation of the extracted data using Markdown for styling in the "formatted_explanation" field.

The current date is ${currentDate}. Use this for relative date calculations.

Output Format:
STRICTLY return ONLY a JSON object. Do NOT include any other text, explanations, or markdown formatting around the JSON itself.
The "formatted_explanation" field should use Markdown for styling (paragraphs, lists, bold, italics).
{
"type": "task" | "reminder" | "note" | "unknown",
"data": { /* fields specific to the type */ },
"original_transcript": "${transcript.replace(/"/g, '\\"')}",
"formatted_explanation": "string (Markdown formatted explanation of what was understood and extracted)"
}

Field Definitions & Inference Rules:

If "type" is "task":
- "title": string (required) - The main subject of the task.
- "description": string (required) - Additional details. **ALWAYS provide a description. If the user only gives a title-like phrase, use the full transcript as the description or a concise summary. If context allows, try to infer a more detailed description using Markdown (e.g., lists for sub-items mentioned).**
- "date": string (optional) - Due date in "YYYY-MM-DD" format.
- "priority": string (required) - "low", "medium", or "high". **ALWAYS provide a priority. Infer this: "high" for keywords like "срочно", "очень важно"; "low" for "не срочно", "позже". If no keywords or ambiguous, ALWAYS default to "medium".**
- "tags": string[] (optional) - Relevant tags.

If "type" is "reminder":
- "title": string (required) - The main subject of the reminder.
- "description": string (required) - Additional details. **ALWAYS provide a description. Infer this similarly to task descriptions, using Markdown if appropriate.**
- "date": string (required) - Date for the reminder in "YYYY-MM-DD" format.
- "time": string (optional) - Time in "HH:MM" (24-hour) format.
- "priority": string (required) - "low", "medium", or "high". **ALWAYS provide a priority. Infer this similarly to task priority. ALWAYS default to "medium" if unclear.**
- "repeat_type": string (optional) - "none", "daily", "weekly", "monthly".
- "repeat_days": number[] (optional) - For "weekly": [1-7] (Mon-Sun, where Monday is 1 and Sunday is 0 or 7 depending on locale, be consistent with typical JS Date getDay() where Sunday is 0). For "monthly": day numbers.
- "repeat_until": string (optional) - Date "YYYY-MM-DD".
- "tags": string[] (optional) - Relevant tags.

If "type" is "note":
- "title": string (required) - Title of the note. Infer a short title if not explicit.
- "content": string (required) - Main body/content of the note, **formatted as rich HTML**.
  ALWAYS provide content.
  The HTML should be well-structured and visually appealing. Utilize a variety of HTML elements and styles, including:
  - Headings: e.g., <h1><span style="font-size: 30px;"><strong>Main Title</strong></span></h1>, <h2>Sub-title</h2>.
  - Paragraphs: <p>Regular text.</p>
  - Lists: Ordered (<ol><li><p>Item 1</p></li><li><p>Item 2</p></li></ol>) and Unordered (<ul><li><p>Bullet A</p></li><li><p>Bullet B</p></li></ul>). List items can contain paragraphs.
  - Blockquotes: <blockquote><p>This is a quote.</p></blockquote>
  - Text styling:
      - Bold: <strong>bold text</strong>
      - Italic: <em>italic text</em>
      - Bold Italic: <strong><em>bold italic text</em></strong>
      - Underline: <u>underlined text</u>
  - Font size: <span style="font-size: 24px;">Large text</span>, <span style="font-size: 12px;">Small text</span>
  - Text alignment: <p style="text-align: center;">Centered text</p>, <p style="text-align: left;">Left-aligned text</p>, <p style="text-align: right;">Right-aligned text</p>
  - Empty paragraphs <p></p> or line breaks <br> can be used for spacing.
  Example for note content:
  "<h1><span style=\"font-size: 28px;\"><strong>Мой план на сегодня</strong></span></h1><ol><li><p>Совещание в <em>10:00</em></p></li><li><p>Обед</p></li><li><p>Подготовить отчет</p></li></ol><blockquote style=\"border-left: 4px solid #ccc; padding-left: 1em; margin-left: 0;\"><p><strong>Важно:</strong> отчет должен быть готов к <span style=\"text-decoration: underline;\">вечеру</span>.</p></blockquote><p style=\"text-align: center;\">Не забыть позвонить маме!</p>"
- "tags": string[] (optional) - Relevant tags.

If intent is unclear, set "type" to "unknown", "data" to an empty object, and "formatted_explanation" to "Не удалось распознать команду. Пожалуйста, попробуйте переформулировать."

General Instructions for "formatted_explanation" (Markdown):
- Start with a confirmation of the recognized type (e.g., "**Создаю задачу:**").
- List the key extracted fields with their values, using bold for field names (e.g., "**Заголовок:** Купить молоко").
- If a field is optional and not extracted, you can omit it or state "не указано".
- Be concise and user-friendly.

Examples:

Input: "Срочно сделать отчет по продажам к следующей пятнице и отправить его Иванову"
(current_date: 2025-06-01 Sat, next Friday: 2025-06-07)
Output:
{
"type": "task",
"data": {
  "title": "Сделать отчет по продажам",
  "description": "Сделать отчет по продажам и отправить его Иванову.",
  "date": "2025-06-07",
  "priority": "high",
  "tags": ["отчет", "продажи", "иванов"]
},
"original_transcript": "Срочно сделать отчет по продажам к следующей пятнице и отправить его Иванову",
"formatted_explanation": "**Создаю задачу:**\\n- **Заголовок:** Сделать отчет по продажам\\n- **Описание:** Сделать отчет по продажам и отправить его Иванову.\\n- **Срок:** 2025-06-07\\n- **Приоритет:** высокий"
}

Input: "Заметка: список покупок. Первое - купить хлеб. Второе - молоко. Третье - яйца. И еще, не забыть масло."
Output:
{
"type": "note",
"data": {
  "title": "Список покупок",
  "content": "<h1><span style=\"font-size: 22px;\"><strong>Список покупок</strong></span></h1><ul><li><p>Хлеб</p></li><li><p>Молоко</p></li><li><p>Яйца</p></li></ul><p><em>Не забыть также купить масло.</em></p>",
  "tags": ["покупки", "продукты"]
},
"original_transcript": "Заметка: список покупок. Первое - купить хлеб. Второе - молоко. Третье - яйца. И еще, не забыть масло.",
"formatted_explanation": "**Создаю заметку:**\\n- **Заголовок:** Список покупок\\n- **Содержание:** (Представлено в виде HTML)\\n- **Теги:** покупки, продукты"
}

Now, analyze the following user text:
"${transcript.replace(/"/g, '\\"')}"
`
}

export async function generateStructuredEntry(
  transcript: string,
): Promise<{ type: string; data: any; original_transcript: string; formatted_explanation: string }> {
  if (!GEMINI_API_KEY) {
    const errorMessage =
      "Ошибка конфигурации: API ключ Gemini не установлен. Укажите GEMINI_API_KEY в lib/gemini-service.ts."
    console.error(errorMessage)
    throw new Error(errorMessage)
  }

  const currentDate = getCurrentDateFormatted()
  const prompt = constructPrompt(transcript, currentDate)
  const apiUrl = `${GEMINI_API_BASE_URL}/${GEMINI_MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error("Ошибка от Gemini API (статус):", response.status, "Тело:", errorBody)
      let apiErrorMessage = `Код ошибки: ${response.status}`
      try {
        const errorJson = JSON.parse(errorBody)
        apiErrorMessage = errorJson?.error?.message || apiErrorMessage
      } catch (e) {
        apiErrorMessage = `${apiErrorMessage}. Ответ: ${errorBody.substring(0, 200)}...`
      }
      throw new Error(`Ошибка от Gemini API: ${apiErrorMessage}.`)
    }

    const responseBody = await response.json()

    if (responseBody.candidates?.[0]?.content?.parts?.[0]?.text) {
      const jsonString = responseBody.candidates[0].content.parts[0].text
      try {
        const structuredData = JSON.parse(jsonString)
        console.log("Распарсенные структурированные данные:", structuredData)
        if (!structuredData.formatted_explanation) {
          structuredData.formatted_explanation = `**Тип:** ${structuredData.type}\n**Данные:** \`\`\`json\n${JSON.stringify(structuredData.data, null, 2)}\n\`\`\``
        }
        return structuredData
      } catch (parseError) {
        console.error("Ошибка парсинга JSON ответа от Gemini:", parseError, "Строка:", jsonString)
        throw new Error("Не удалось распарсить JSON ответ от Gemini.")
      }
    } else {
      console.error("Не удалось извлечь текст из ответа Gemini. Структура ответа:", responseBody)
      throw new Error("Не удалось извлечь текст из ответа Gemini.")
    }
  } catch (error) {
    console.error("Ошибка при взаимодействии с Gemini API:", error)
    if (error instanceof Error) throw error
    throw new Error("Неизвестная ошибка при отправке запроса к Gemini API.")
  }
}
