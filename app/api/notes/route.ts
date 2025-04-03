import { type NextRequest, NextResponse } from "next/server"
import { createNote, getUserNotes } from "@/lib/db"

// Обработчик GET запроса для получения всех заметок пользователя
export async function GET(request: NextRequest) {
  try {
    // Get login from URL query parameter
    const url = new URL(request.url)
    const login = url.searchParams.get("login")

    if (!login) {
      return NextResponse.json({ success: false, message: "Логин пользователя не указан" }, { status: 400 })
    }

    const notes = await getUserNotes(login)

    // Устанавливаем заголовки для предотвращения кэширования
    const headers = new Headers()
    headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    headers.set("Pragma", "no-cache")
    headers.set("Expires", "0")
    headers.set("Surrogate-Control", "no-store")

    return NextResponse.json(
      { success: true, notes },
      {
        headers,
        status: 200,
      },
    )
  } catch (error) {
    console.error("Ошибка при получении заметок:", error)
    return NextResponse.json({ success: false, message: "Ошибка сервера при получении заметок" }, { status: 500 })
  }
}

// Обработчик POST запроса для создания новой заметки
export async function POST(request: NextRequest) {
  try {
    const { login, title, content, tags } = await request.json()

    // Проверка обязательных полей
    if (!login || !title) {
      return NextResponse.json({ success: false, message: "Не все обязательные поля заполнены" }, { status: 400 })
    }

    const result = await createNote({
      login,
      title,
      content: content || "",
      tags: tags || [],
    })

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, note: result.note })
  } catch (error) {
    console.error("Ошибка при создании заметки:", error)
    return NextResponse.json({ success: false, message: "Ошибка сервера при создании заметки" }, { status: 500 })
  }
}

