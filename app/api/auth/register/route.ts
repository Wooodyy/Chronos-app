import { type NextRequest, NextResponse } from "next/server"
import { registerUser } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { login, firstName, lastName, email, password } = await request.json()

    // Проверка обязательных полей
    if (!login || !firstName || !email || !password) {
      return NextResponse.json({ success: false, message: "Не все обязательные поля заполнены" }, { status: 400 })
    }

    const result = await registerUser({
      login,
      firstName,
      lastName,
      email,
      password,
    })

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, user: result.user })
  } catch (error) {
    console.error("Ошибка при регистрации:", error)
    return NextResponse.json({ success: false, message: "Ошибка сервера при регистрации" }, { status: 500 })
  }
}

