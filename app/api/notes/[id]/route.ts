import { type NextRequest, NextResponse } from "next/server"
import { getNoteById, updateNote, deleteNote } from "@/lib/db"

// Обработчик GET запроса для получения заметки по ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ success: false, message: "ID заметки не указан" }, { status: 400 })
    }

    const note = await getNoteById(id)

    if (!note) {
      return NextResponse.json({ success: false, message: "Заметка не найдена" }, { status: 404 })
    }

    return NextResponse.json({ success: true, note })
  } catch (error) {
    console.error("Ошибка при получении заметки:", error)
    return NextResponse.json({ success: false, message: "Ошибка сервера при получении заметки" }, { status: 500 })
  }
}

// Обработчик PUT запроса для обновления заметки
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    const { title, content, tags } = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, message: "ID заметки не указан" }, { status: 400 })
    }

    const success = await updateNote(id, {
      title,
      content,
      tags,
    })

    if (!success) {
      return NextResponse.json({ success: false, message: "Заметка не найдена или не обновлена" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Ошибка при обновлении заметки:", error)
    return NextResponse.json({ success: false, message: "Ошибка сервера при обновлении заметки" }, { status: 500 })
  }
}

// Обработчик DELETE запроса для удаления заметки
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ success: false, message: "ID заметки не указан" }, { status: 400 })
    }

    const success = await deleteNote(id)

    if (!success) {
      return NextResponse.json({ success: false, message: "Заметка не найдена или не удалена" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Ошибка при удалении заметки:", error)
    return NextResponse.json({ success: false, message: "Ошибка сервера при удалении заметки" }, { status: 500 })
  }
}

