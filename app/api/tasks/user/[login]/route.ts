import { type NextRequest, NextResponse } from "next/server"
import { getUserTasks } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { login: string } }) {
  try {
    const { login } = await params

    if (!login) {
      return NextResponse.json({ success: false, message: "Логин пользователя не указан" }, { status: 400 })
    }

    const tasks = await getUserTasks(login)

    return NextResponse.json({ success: true, tasks })
  } catch (error) {
    console.error("Ошибка при получении задач:", error)
    return NextResponse.json({ success: false, message: "Ошибка сервера при получении задач" }, { status: 500 })
  }
}

