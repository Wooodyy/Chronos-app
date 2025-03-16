"use client"

import { Bell, Mail, Moon, Sun } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"

export function NotificationSettings() {
  const { theme, setTheme } = useTheme()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Настройки уведомлений</CardTitle>
        <CardDescription>Настройте способы получения уведомлений</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between space-x-2">
          <div className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <Label htmlFor="push">Push-уведомления</Label>
          </div>
          <Switch id="push" defaultChecked />
        </div>
        <div className="flex items-center justify-between space-x-2">
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <Label htmlFor="email">Email-уведомления</Label>
          </div>
          <Switch id="email" defaultChecked />
        </div>
        <div className="flex items-center justify-between space-x-2">
          <div className="flex items-center space-x-2">
            <motion.div initial={false} animate={{ rotate: theme === "dark" ? 360 : 0 }} transition={{ duration: 0.3 }}>
              {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </motion.div>
            <Label htmlFor="theme">Темная тема</Label>
          </div>
          <Switch
            id="theme"
            checked={theme === "dark"}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          />
        </div>
      </CardContent>
    </Card>
  )
}

