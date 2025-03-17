import { type NextRequest, NextResponse } from "next/server"
import { updateTaskCompletion } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    const { completed } = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, message: "ID задачи не указан" }, { status: 400 })
    }

    const success = await updateTaskCompletion(id, completed)

    if (!success) {
      return NextResponse.json({ success: false, message: "Задача не найдена или не обновлена" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Ошибка при обновлении статуса задачи:", error)
    return NextResponse.json(
      { success: false, message: "Ошибка сервера при обновлении статуса задачи" },
      { status: 500 },
    )
  }
}

