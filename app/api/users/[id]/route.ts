import { type NextRequest, NextResponse } from "next/server"
import { getUserById, updateUser } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    const userId = Number.parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json({ success: false, message: "Некорректный ID пользователя" }, { status: 400 })
    }

    const user = await getUserById(userId)

    if (!user) {
      return NextResponse.json({ success: false, message: "Пользователь не найден" }, { status: 404 })
    }

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("Ошибка при получении пользователя:", error)
    return NextResponse.json({ success: false, message: "Ошибка сервера при получении пользователя" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    const userId = Number.parseInt(id)
    const { firstName, lastName, email } = await request.json()

    if (isNaN(userId)) {
      return NextResponse.json({ success: false, message: "Некорректный ID пользователя" }, { status: 400 })
    }

    const result = await updateUser(userId, { firstName, lastName, email })

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Данные пользователя обновлены",
      user: result.user,
    })
  } catch (error) {
    console.error("Ошибка при обновлении пользователя:", error)
    return NextResponse.json({ success: false, message: "Ошибка сервера при обновлении пользователя" }, { status: 500 })
  }
}

