"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Lock, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useNotification } from "@/components/ui/notification"
import { useLanguage } from "@/contexts/language-context"

const passwordFormSchema = z
  .object({
    currentPassword: z.string(),
    newPassword: z.string().min(6, {
      message: "profile.passwordMinLength",
    }),
    confirmPassword: z.string().min(6, {
      message: "profile.passwordMinLength",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "profile.passwordMismatch",
    path: ["confirmPassword"],
  })

export function PasswordForm() {
  const [isChanging, setIsChanging] = useState(false)
  const { user } = useAuth()
  const { showNotification } = useNotification()
  const { t } = useLanguage()

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  // Watch all password fields to determine if button should be enabled
  const currentPassword = form.watch("currentPassword")
  const newPassword = form.watch("newPassword")
  const confirmPassword = form.watch("confirmPassword")

  // Check if all fields are filled
  const isFormComplete = currentPassword && newPassword && confirmPassword

  async function onSubmit(data: z.infer<typeof passwordFormSchema>) {
    if (!user) return

    setIsChanging(true)

    try {
      const response = await fetch(`/api/users/${user.id}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      })

      const result = await response.json()

      if (result.success) {
        showNotification(t("profile.passwordUpdated"), "success")
        form.reset()
      } else {
        showNotification(result.message || t("profile.passwordUpdateError"), "error")
      }
    } catch (error) {
      console.error("Error changing password:", error)
      showNotification(t("profile.passwordUpdateError"), "error")
    } finally {
      setIsChanging(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">{t("profile.passwordChange")}</h3>

      <Form {...form}>
        <form id="password-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("profile.currentPassword")}</FormLabel>
                <div className="flex items-center relative">
                  <Lock className="h-4 w-4 mr-2 text-muted-foreground absolute left-2" />
                  <FormControl>
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      {...field}
                      className="pl-8 border-[#8b5cf6]/50 focus:border-[#8b5cf6] shadow-[0_0_10px_rgba(139,92,246,0.1)]"
                    />
                  </FormControl>
                  <button
                    type="button"
                    className="absolute right-2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("profile.newPassword")}</FormLabel>
                <div className="flex items-center relative">
                  <Lock className="h-4 w-4 mr-2 text-muted-foreground absolute left-2" />
                  <FormControl>
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      {...field}
                      className="pl-8 border-[#8b5cf6]/50 focus:border-[#8b5cf6] shadow-[0_0_10px_rgba(139,92,246,0.1)]"
                    />
                  </FormControl>
                  <button
                    type="button"
                    className="absolute right-2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("profile.confirmPassword")}</FormLabel>
                <div className="flex items-center relative">
                  <Lock className="h-4 w-4 mr-2 text-muted-foreground absolute left-2" />
                  <FormControl>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      {...field}
                      className="pl-8 border-[#8b5cf6]/50 focus:border-[#8b5cf6] shadow-[0_0_10px_rgba(139,92,246,0.1)]"
                    />
                  </FormControl>
                  <button
                    type="button"
                    className="absolute right-2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isChanging || !isFormComplete}
              className="bg-[#8b5cf6] hover:bg-[#7c3aed] shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-shadow"
            >
              {isChanging ? t("profile.saving") : t("profile.passwordChange")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
