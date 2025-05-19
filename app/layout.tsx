import type React from "react"
import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { LanguageProvider } from "@/contexts/language-context"
import { ToastProvider } from "@/components/ui/toast-provider"
import { cn } from "@/lib/utils"
import { AppWrapper } from "@/components/layout/app-wrapper"

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  variable: "--font-montserrat",
})

export const metadata: Metadata = {
  title: "Chronos",
  description: "Ваш личный цифровой ассистент для задач, напоминаний и заметок",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
    shortcut: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className={cn(montserrat.variable, "font-sans antialiased")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <LanguageProvider>
              <ToastProvider>
                <AppWrapper>{children}</AppWrapper>
              </ToastProvider>
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
