import { NextResponse } from "next/server"
import { getUserReminders } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { login: string } }) {
  try {
    const { login } = await params
    const reminders = await getUserReminders(login)
    return NextResponse.json({ success: true, reminders })
  } catch (error) {
    console.error("Error fetching user reminders:", error)
    return NextResponse.json(
      { success: false, message: "Произошла ошибка при получении напоминаний пользователя" },
      { status: 500 },
    )
  }
}
