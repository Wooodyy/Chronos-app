import { type NextRequest, NextResponse } from "next/server"
import { createTask } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { login, title, description, date, priority, tags } = await request.json()

    // Проверка обязательных полей
    if (!login || !title || !date) {
      return NextResponse.json({ success: false, message: "Не все обязательные поля заполнены" }, { status: 400 })
    }

    const result = await createTask({
      login,
      title,
      description,
      date: new Date(date),
      priority,
      tags,
    })

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, task: result.task })
  } catch (error) {
    console.error("Ошибка при создании задачи:", error)
    return NextResponse.json({ success: false, message: "Ошибка сервера при создании задачи" }, { status: 500 })
  }
}

