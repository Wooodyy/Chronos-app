import { NextResponse } from "next/server"
import { getReminderById, updateReminder, deleteReminder } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const reminder = await getReminderById(params.id)

    if (!reminder) {
      return NextResponse.json({ success: false, message: "Напоминание не найдено" }, { status: 404 })
    }

    return NextResponse.json({ success: true, reminder })
  } catch (error) {
    console.error("Error fetching reminder:", error)
    return NextResponse.json({ success: false, message: "Произошла ошибка при получении напоминания" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const { title, description, priority, date, time, repeat_type, repeat_days, repeat_until, tags } = data

    // Обновляем напоминание
    const success = await updateReminder(params.id, {
      title,
      description,
      priority,
      date: date ? new Date(date) : undefined,
      time,
      repeat_type,
      repeat_days,
      repeat_until: repeat_until ? new Date(repeat_until) : undefined,
      tags,
    })

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, message: "Не удалось обновить напоминание" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error updating reminder:", error)
    return NextResponse.json(
      { success: false, message: "Произошла ошибка при обновлении напоминания" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const success = await deleteReminder(params.id)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, message: "Не удалось удалить напоминание" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error deleting reminder:", error)
    return NextResponse.json({ success: false, message: "Произошла ошибка при удалении напоминания" }, { status: 500 })
  }
}
