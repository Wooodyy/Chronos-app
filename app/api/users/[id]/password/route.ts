import { type NextRequest, NextResponse } from "next/server"
import { updateUserPassword } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const userId = Number.parseInt(id)
    const { currentPassword, newPassword } = await request.json()

    if (isNaN(userId)) {
      return NextResponse.json({ success: false, message: "Некорректный ID пользователя" }, { status: 400 })
    }

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Необходимо указать текущий и новый пароль" },
        { status: 400 },
      )
    }

    const result = await updateUserPassword(userId, currentPassword, newPassword)

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Пароль успешно обновлен",
    })
  } catch (error) {
    console.error("Ошибка при обновлении пароля:", error)
    return NextResponse.json({ success: false, message: "Ошибка сервера при обновлении пароля" }, { status: 500 })
  }
}
