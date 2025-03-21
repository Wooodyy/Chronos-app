"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Camera, Mail, User, Lock, Save, Moon, Sun, User2, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { format } from "date-fns"
import { ImageCropper } from "@/components/features/profile/image-cropper"
import { useNotification } from "@/components/ui/notification"

export default function ProfilePage() {
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { user, logout, updateUserData } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showNotification } = useNotification()

  // Состояние для формы
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Состояние для обрезки изображения
  const [cropperOpen, setCropperOpen] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)

  // Предотвращаем гидрацию
  useEffect(() => {
    setMounted(true)

    // Заполняем форму данными пользователя
    if (user) {
      if (user.firstName) setFirstName(user.firstName)
      if (user.lastName) setLastName(user.lastName)
      console.log("User data loaded:", user) // Добавим для отладки
      if (user.email) setEmail(user.email)
      if (user.avatar) setAvatarPreview(user.avatar)
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Показываем уведомление
        showNotification("Данные профиля успешно обновлены", "success")

        // Обновляем данные пользователя
        await updateUserData()
      } else {
        // Показываем уведомление об ошибке
        showNotification(data.message || "Не удалось обновить профиль", "error")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      // Показываем уведомление об ошибке
      showNotification("Произошла ошибка при обновлении профиля", "error")
    } finally {
      setIsSaving(false)
    }
  }

  // Обработчик клика по кнопке загрузки аватара
  const handleAvatarButtonClick = () => {
    fileInputRef.current?.click()
  }

  // Обработчик изменения файла аватара
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]

    // Проверка типа файла
    if (!file.type.startsWith("image/")) {
      showNotification("Пожалуйста, выберите изображение", "error")
      return
    }

    // Проверка размера файла (не более 5 МБ)
    if (file.size > 5 * 1024 * 1024) {
      showNotification("Размер файла не должен превышать 5 МБ", "error")
      return
    }

    // Создаем превью изображения для обрезки
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageToCrop(event.target.result as string)
        setCropperOpen(true)
      }
    }
    reader.readAsDataURL(file)

    // Сбрасываем значение input, чтобы можно было загрузить тот же файл повторно
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Обработчик завершения обрезки
  const handleCropComplete = async (croppedImage: string) => {
    if (!user) return

    setCropperOpen(false)
    setAvatarPreview(croppedImage)
    setIsUploadingAvatar(true)

    try {
      // Преобразуем base64 в Blob
      const response = await fetch(croppedImage)
      const blob = await response.blob()

      // Создаем файл из Blob
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" })

      // Создаем FormData и добавляем файл
      const formData = new FormData()
      formData.append("avatar", file)

      // Отправляем на сервер
      const uploadResponse = await fetch(`/api/users/${user.id}/avatar`, {
        method: "POST",
        body: formData,
      })

      const data = await uploadResponse.json()

      if (data.success) {
        // Показываем уведомление
        showNotification("Аватар успешно обновлен", "success")

        // Обновляем данные пользователя
        await updateUserData()
      } else {
        // Показываем уведомление об ошибке
        showNotification(data.message || "Не удалось обновить аватар", "error")
      }
    } catch (error) {
      console.error("Error uploading avatar:", error)
      // Показываем уведомление об ошибке
      showNotification("Произошла ошибка при загрузке аватара", "error")
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // Обработчик отмены обрезки
  const handleCropCancel = () => {
    setCropperOpen(false)
    setImageToCrop(null)
  }

  // Форматирование даты создания аккаунта
  const formatCreatedAt = () => {
    if (!user?.created_at) return "недавно"

    try {
      const date = new Date(user.created_at)
      return format(date, "dd.MM.yyyy")
    } catch (error) {
      return "недавно"
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Mobile padding for header */}
      <div className="h-16 md:hidden" />

      <div className="flex-1 p-4 md:p-8 space-y-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 aspect-square">
            <User2 className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Профиль</h1>
            <p className="text-sm text-muted-foreground mt-1">Управляйте аккаунтом и параметрами</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <Card className="border-none shadow-md overflow-hidden md:w-1/3 h-full">
            <CardHeader className="text-center">
              <div className="mx-auto relative group">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarPreview || user?.avatar || undefined} />
                  <AvatarFallback>{user?.name?.substring(0, 2) || "U"}</AvatarFallback>
                </Avatar>
                <button
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleAvatarButtonClick}
                  disabled={isUploadingAvatar}
                >
                  {isUploadingAvatar ? <span className="animate-spin">⏳</span> : <Camera className="h-4 w-4" />}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={isUploadingAvatar}
                />
              </div>
              <CardTitle className="mt-2">{user?.name || "Пользователь"}</CardTitle>
              <CardDescription>{user?.email || "user@example.com"}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">Присоединился {formatCreatedAt()}</p>
              <Button variant="outline" className="mt-4 w-full" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Выйти из аккаунта
              </Button>
            </CardContent>
          </Card>

          <div className="flex-1">
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="account">Аккаунт</TabsTrigger>
                <TabsTrigger value="notifications">Настройки</TabsTrigger>
              </TabsList>

              <TabsContent value="account" className="mt-6">
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle>Информация профиля</CardTitle>
                    <CardDescription>Обновите свою личную информацию</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Имя</Label>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Фамилия</Label>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Пароль</Label>
                      <div className="flex items-center">
                        <Lock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <Input id="password" type="password" defaultValue="********" disabled />
                      </div>
                      <p className="text-xs text-muted-foreground">Для изменения пароля обратитесь к администратору</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSave} disabled={isSaving} className="ml-auto gap-2">
                      <Save className="h-4 w-4" />
                      {isSaving ? "Сохранение..." : "Сохранить изменения"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="mt-6">
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle>Настройки уведомлений</CardTitle>
                    <CardDescription>Настройте, как и когда вы хотите получать уведомления</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email уведомления</p>
                        <p className="text-sm text-muted-foreground">Получать уведомления по электронной почте</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Напоминания о задачах</p>
                        <p className="text-sm text-muted-foreground">Получать напоминания о предстоящих задачах</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    {mounted && (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Темная тема</p>
                          <p className="text-sm text-muted-foreground">Переключение между светлой и темной темой</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.div
                            initial={false}
                            animate={{ rotate: theme === "dark" ? 360 : 0 }}
                            transition={{ duration: 0.5, type: "spring" }}
                          >
                            {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                          </motion.div>
                          <Switch
                            checked={theme === "dark"}
                            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSave} disabled={isSaving} className="ml-auto gap-2">
                      <Save className="h-4 w-4" />
                      {isSaving ? "Сохранение..." : "Сохранить настройки"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Компонент для обрезки изображения */}
      {imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          open={cropperOpen}
        />
      )}

      {/* Mobile padding for bottom navigation */}
      <div className="h-20 md:hidden" />
    </div>
  )
}

