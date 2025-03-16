"use client"

import { Bell, Mail } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function NotificationSettings() {
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
      </CardContent>
    </Card>
  )
}

