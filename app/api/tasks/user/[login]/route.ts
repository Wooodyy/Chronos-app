import { type NextRequest, NextResponse } from "next/server"
import { getUserTasks } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { login: string } }) {
  try {
    const { login } = await params

    if (!login) {
      return NextResponse.json({ success: false, message: "Логин пользователя не указан" }, { status: 400 })
    }

    const tasks = await getUserTasks(login)

    // Устанавливаем заголовки для предотвращения кэширования
    const headers = new Headers()
    headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    headers.set("Pragma", "no-cache")
    headers.set("Expires", "0")
    headers.set("Surrogate-Control", "no-store")

    return NextResponse.json(
      { success: true, tasks },
      {
        headers,
        status: 200,
      },
    )
  } catch (error) {
    console.error("Ошибка при получении задач:", error)
    return NextResponse.json({ success: false, message: "Ошибка сервера при получении задач" }, { status: 500 })
  }
}

