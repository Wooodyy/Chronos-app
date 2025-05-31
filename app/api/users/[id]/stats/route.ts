import { type NextRequest, NextResponse } from "next/server"
import { getUserStats, getUserById } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = Number.parseInt(params.id)

    if (isNaN(userId)) {
      return NextResponse.json({ success: false, message: "Некорректный ID пользователя" }, { status: 400 })
    }

    // Получаем пользователя для получения логина
    const user = await getUserById(userId)
    if (!user) {
      return NextResponse.json({ success: false, message: "Пользователь не найден" }, { status: 404 })
    }

    // Получаем статистику
    const stats = await getUserStats(user.login)

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("Ошибка получения статистики:", error)
    return NextResponse.json({ success: false, message: "Ошибка сервера" }, { status: 500 })
  }
}
