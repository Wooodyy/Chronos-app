import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { login, password } = await request.json()

    if (!login || !password) {
      return NextResponse.json({ success: false, message: "Логин и пароль обязательны" }, { status: 400 })
    }

    const user = await authenticateUser(login, password)

    if (!user) {
      return NextResponse.json({ success: false, message: "Неверный логин или пароль" }, { status: 401 })
    }

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("Ошибка при входе:", error)
    return NextResponse.json({ success: false, message: "Ошибка сервера при входе" }, { status: 500 })
  }
}

