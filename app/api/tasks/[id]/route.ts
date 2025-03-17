import { type NextRequest, NextResponse } from "next/server"
import { getTaskById, deleteTask, updateTask } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ success: false, message: "ID задачи не указан" }, { status: 400 })
    }

    const task = await getTaskById(id)

    if (!task) {
      return NextResponse.json({ success: false, message: "Задача не найдена" }, { status: 404 })
    }

    return NextResponse.json({ success: true, task })
  } catch (error) {
    console.error("Ошибка при получении задачи:", error)
    return NextResponse.json({ success: false, message: "Ошибка сервера при получении задачи" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ success: false, message: "ID задачи не указан" }, { status: 400 })
    }

    const success = await deleteTask(id)

    if (!success) {
      return NextResponse.json({ success: false, message: "Задача не найдена или не удалена" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Ошибка при удалении задачи:", error)
    return NextResponse.json({ success: false, message: "Ошибка сервера при удалении задачи" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    const { title, description, date, priority, tags } = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, message: "ID задачи не указан" }, { status: 400 })
    }

    const success = await updateTask(id, {
      title,
      description,
      date: new Date(date),
      priority,
      tags,
    })

    if (!success) {
      return NextResponse.json({ success: false, message: "Задача не найдена или не обновлена" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Ошибка при обновлении задачи:", error)
    return NextResponse.json({ success: false, message: "Ошибка сервера при обновлении задачи" }, { status: 500 })
  }
}

