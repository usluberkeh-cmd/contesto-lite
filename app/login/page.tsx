"use client"

import { useMemo, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { AuthChangeEvent, Session } from "@supabase/supabase-js"

import { AuthShell } from "@/components/auth/auth-shell"
import { OAuthButtons } from "@/components/auth/oauth-buttons"
import { PasswordLoginForm } from "@/components/auth/password-login-form"
import type { AuthStatus } from "@/components/auth/types"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<AuthStatus | null>(null)
  const [magicEmail, setMagicEmail] = useState("")
  const [isMagicSending, setIsMagicSending] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const redirectTo = useMemo(() => {
    // # Reason: Ensure OAuth + magic-link redirects work in local and production environments.
    if (process.env.NEXT_PUBLIC_APP_URL) {
      // # Reason: Normalize env URL to avoid double slashes or trailing spaces breaking allowlisted redirects.
      const normalizedAppUrl = process.env.NEXT_PUBLIC_APP_URL.trim().replace(/\/+$/, "")
      return `${normalizedAppUrl}/auth/callback`
    }
    if (typeof window !== "undefined") {
      return `${window.location.origin}/auth/callback`
    }
    return "/auth/callback"
  }, [])
  const statusClasses = {
    error: "border-red-200 bg-red-50 text-red-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    info: "border-slate-200 bg-slate-50 text-slate-700",
  } satisfies Record<AuthStatus["tone"], string>

  useEffect(() => {
    if (cooldownSeconds <= 0) return

    const timer = setInterval(() => {
      setCooldownSeconds((current) => Math.max(0, current - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [cooldownSeconds])

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          router.replace('/')
          return
        }
      } catch (error) {
        console.error('Session check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_IN' && session) {
          router.replace('/')
        } else if (event === 'SIGNED_OUT') {
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth, router])

  const handleMagicLinkSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (cooldownSeconds > 0) {
      setStatus({
        tone: "error",
        text: `Veuillez patienter ${cooldownSeconds} secondes avant de réessayer.`,
      })
      return
    }

    const normalizedEmail = magicEmail.trim().toLowerCase()
    if (!normalizedEmail) {
      setStatus({ tone: "error", text: "Veuillez saisir une adresse email valide." })
      return
    }

    setIsMagicSending(true)
    setStatus(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: redirectTo,
        },
      })

      if (error) {
        if (error.status === 429 || /rate limit/i.test(error.message)) {
          setCooldownSeconds(60)
          setStatus({
            tone: "error",
            text: "Trop de demandes. Réessayez dans 60 secondes.",
          })
          return
        }

        setStatus({ tone: "error", text: error.message })
        return
      }

      setStatus({ tone: "success", text: "Check your email for the magic link!" })
    } catch (error) {
      console.error("Magic link error:", error)
      setStatus({
        tone: "error",
        text: "Impossible d'envoyer le lien. Réessayez plus tard.",
      })
    } finally {
      setIsMagicSending(false)
    }
  }

  // Show loading state while checking session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Vérification de la session...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthShell
      desktopIntro={
        <>
          <h2 className="text-4xl font-bold text-slate-900 mb-3">Welcome Back</h2>
          <p className="text-base text-slate-600">Connectez-vous pour accéder à votre espace</p>
        </>
      }
      mobileIntro={
        <>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
          <p className="text-base text-slate-600">Accédez à votre espace de contestation</p>
        </>
      }
      footerNote={
        <>
          En vous connectant, vous acceptez nos{" "}
          <Link
            href="/terms"
            className="text-slate-700 hover:text-slate-900 underline underline-offset-2"
          >
            Conditions d'utilisation
          </Link>{" "}
          et notre{" "}
          <Link
            href="/privacy"
            className="text-slate-700 hover:text-slate-900 underline underline-offset-2"
          >
            Politique de confidentialité
          </Link>
          .
        </>
      }
    >
      <div className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold text-slate-900">Connexion</h3>
          <p className="text-sm text-slate-600">
            Choisissez la méthode la plus simple pour vous connecter.
          </p>
        </div>

        {status && (
          <div
            role="status"
            aria-live="polite"
            className={`rounded-lg border px-3 py-2 text-sm ${statusClasses[status.tone]}`}
          >
            {status.text}
          </div>
        )}

        <div className="space-y-6">
          <OAuthButtons supabase={supabase} redirectTo={redirectTo} onStatus={setStatus} />

          <div className="flex items-center gap-3 text-xs uppercase text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            Or sign in with email link
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <form className="space-y-3" onSubmit={handleMagicLinkSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <Input
                type="email"
                autoComplete="email"
                placeholder="you@email.com"
                value={magicEmail}
                onChange={(event) => setMagicEmail(event.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isMagicSending || !magicEmail.trim() || cooldownSeconds > 0}
            >
              {isMagicSending
                ? "Envoi..."
                : cooldownSeconds > 0
                  ? `Réessayez dans ${cooldownSeconds}s`
                  : "Send Magic Link"}
            </Button>
          </form>
        </div>

        <Accordion type="single" collapsible className="rounded-xl border border-slate-200">
          <AccordionItem value="password" className="border-none">
            <AccordionTrigger className="px-4 py-4 text-sm font-semibold text-slate-900 hover:no-underline">
              Sign in with email & password
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <PasswordLoginForm supabase={supabase} onStatus={setStatus} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <p className="text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-slate-900 underline underline-offset-4"
          >
            Sign up
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
