import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "next-themes"
import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { AppHeader } from "@/components/app-header"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "Contester Une Amende en Ligne | OCR + Avocats | Contesto",
  description:
    "Contestez votre amende radar automatiquement. Analyse OCR gratuite + revision par avocat. 94% de succes. Conservez vos points et votre argent. Des 49€.",
  generator: "v0.app",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  let user: { email: string | null; isGuest: boolean } | null = null

  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      const isGuest = Boolean(data.user.is_anonymous)
      user = {
        email: isGuest ? null : data.user.email?.trim() || null,
        isGuest,
      }
    }
  } catch {
    // Auth check failed silently — user stays null
  }

  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`font-sans ${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppHeader user={user} />
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          <Toaster />
          <WhatsAppButton />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
