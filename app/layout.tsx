import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { AppHeader } from "@/components/app-header"
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
  title: "Contester Une Amende en Ligne | Score IA + Avocats | Contesto",
  description:
    "Contestez votre amende radar automatiquement. Analyse IA gratuite + révision par avocat. 94% de succès. Conservez vos points et votre argent. Dès 49€.",
  generator: "v0.app",
}

/** Routes where the shared header should NOT appear */
const PUBLIC_AUTH_ROUTES = ["/login", "/signup", "/auth", "/forgot-password", "/reset-password"]

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersList = await headers()
  const pathname = headersList.get("x-next-pathname") ?? headersList.get("x-invoke-path") ?? ""

  const isAuthRoute = PUBLIC_AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  let user: { email: string } | null = null

  if (!isAuthRoute) {
    try {
      const supabase = await createClient()
      const { data } = await supabase.auth.getUser()
      if (data.user?.email) {
        user = { email: data.user.email }
      }
    } catch {
      // Auth check failed silently — user stays null
    }
  }

  return (
    <html lang="fr">
      <body className={`font-sans ${geistSans.variable} ${geistMono.variable} antialiased`}>
        {!isAuthRoute && <AppHeader user={user} />}
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
