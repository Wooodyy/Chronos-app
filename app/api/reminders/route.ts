import { NextResponse } from "next/server"
import { createReminder } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { login, title, description, priority, date, time, repeat_type, repeat_days, repeat_until, tags } = data

    // Проверяем обязательные поля
    if (!login || !title || !date) {
      return NextResponse.json(
        { success: false, message: "Отсутствуют обязательные поля: login, title, date" },
        { status: 400 },
      )
    }

    // Создаем напоминание
    const result = await createReminder({
      login,
      title,
      description,
      priority,
      date: new Date(date),
      time,
      repeat_type,
      repeat_days,
      repeat_until: repeat_until ? new Date(repeat_until) : undefined,
      tags,
    })

    if (result.success) {
      return NextResponse.json({ success: true, reminder: result.reminder })
    } else {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 })
    }
  } catch (error) {
    console.error("Error creating reminder:", error)
    return NextResponse.json({ success: false, message: "Произошла ошибка при создании напоминания" }, { status: 500 })
  }
}
