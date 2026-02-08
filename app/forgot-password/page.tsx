"use client"

import { useMemo, useState } from "react"
import Link from "next/link"

import { AuthShell } from "@/components/auth/auth-shell"
import type { AuthStatus } from "@/components/auth/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
  const supabase = useMemo(() => createClient(), [])
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<AuthStatus | null>(null)
  const [isSending, setIsSending] = useState(false)
  const resetRedirectTo = useMemo(() => {
    // # Reason: Ensure password recovery links redirect correctly in all environments.
    if (process.env.NEXT_PUBLIC_APP_URL) {
      const normalizedAppUrl = process.env.NEXT_PUBLIC_APP_URL.trim().replace(/\/+$/, "")
      return `${normalizedAppUrl}/reset-password`
    }
    if (typeof window !== "undefined") {
      return `${window.location.origin}/reset-password`
    }
    return "/reset-password"
  }, [])
  const statusClasses = {
    error: "border-red-200 bg-red-50 text-red-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    info: "border-slate-200 bg-slate-50 text-slate-700",
  } satisfies Record<AuthStatus["tone"], string>

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail) {
      setStatus({ tone: "error", text: "Veuillez saisir une adresse email valide." })
      return
    }

    setIsSending(true)
    setStatus(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: resetRedirectTo,
      })

      if (error) {
        setStatus({ tone: "error", text: error.message })
        return
      }

      setStatus({
        tone: "success",
        text: "Si l'email existe, un lien de réinitialisation vient d'être envoyé.",
      })
    } catch (error) {
      console.error("Password reset error:", error)
      setStatus({
        tone: "error",
        text: "Impossible d'envoyer le lien pour le moment.",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <AuthShell
      desktopIntro={
        <>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Mot de passe oublié</h2>
          <p className="text-slate-600">Recevez un lien pour créer un nouveau mot de passe</p>
        </>
      }
      mobileIntro={
        <>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Réinitialiser</h2>
          <p className="text-slate-600">Nous allons vous envoyer un lien sécurisé</p>
        </>
      }
      footerNote={
        <>
          Vous vous souvenez de votre mot de passe ?{" "}
          <Link
            href="/login"
            className="text-slate-700 hover:text-slate-900 underline underline-offset-2"
          >
            Se connecter
          </Link>
          .
        </>
      }
    >
      <div className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900">Recevoir un lien</h3>
          <p className="text-sm text-slate-600">
            Entrez votre email pour recevoir un lien de réinitialisation.
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

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Adresse email</label>
            <Input
              type="email"
              autoComplete="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isSending || !email.trim()}
          >
            {isSending ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </div>
    </AuthShell>
  )
}
