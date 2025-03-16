import { type NextRequest, NextResponse } from "next/server"
import { updateUserAvatar } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    const userId = Number.parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json({ success: false, message: "Некорректный ID пользователя" }, { status: 400 })
    }

    const formData = await request.formData()
    const avatarFile = formData.get("avatar") as File

    if (!avatarFile) {
      return NextResponse.json({ success: false, message: "Файл аватара не предоставлен" }, { status: 400 })
    }

    const buffer = Buffer.from(await avatarFile.arrayBuffer())
    const success = await updateUserAvatar(userId, buffer)

    if (!success) {
      return NextResponse.json({ success: false, message: "Не удалось обновить аватар" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Аватар успешно обновлен",
    })
  } catch (error) {
    console.error("Ошибка при обновлении аватара:", error)
    return NextResponse.json({ success: false, message: "Ошибка сервера при обновлении аватара" }, { status: 500 })
  }
}

