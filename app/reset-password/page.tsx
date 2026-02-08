"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle2, Circle } from "lucide-react"

import { AuthShell } from "@/components/auth/auth-shell"
import type { AuthStatus } from "@/components/auth/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

const PASSWORD_REQUIREMENTS = [
  {
    id: "length",
    label: "Au moins 8 caractères",
    test: (value: string) => value.length >= 8,
  },
  {
    id: "uppercase",
    label: "Au moins une majuscule",
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    id: "number",
    label: "Au moins un chiffre",
    test: (value: string) => /\d/.test(value),
  },
  {
    id: "special",
    label: "Au moins un caractère spécial",
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
] as const

function readRecoveryParams() {
  if (typeof window === "undefined") return { type: null, tokenHash: null }
  const searchParams = new URLSearchParams(window.location.search)
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""))

  return {
    type: hashParams.get("type") ?? searchParams.get("type"),
    tokenHash: hashParams.get("token_hash") ?? searchParams.get("token_hash"),
  }
}

export default function ResetPasswordPage() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [canReset, setCanReset] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [status, setStatus] = useState<AuthStatus | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const statusClasses = {
    error: "border-red-200 bg-red-50 text-red-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    info: "border-slate-200 bg-slate-50 text-slate-700",
  } satisfies Record<AuthStatus["tone"], string>

  const passwordChecks = PASSWORD_REQUIREMENTS.map((requirement) => ({
    ...requirement,
    isMet: requirement.test(password),
  }))

  useEffect(() => {
    let isActive = true

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setCanReset(true)
      }
    })

    const initRecovery = async () => {
      const { type, tokenHash } = readRecoveryParams()
      if (type === "recovery" && tokenHash) {
        // # Reason: Explicitly verify the token hash when it is present in the URL.
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery",
        })

        if (!isActive) return

        if (error) {
          setStatus({
            tone: "error",
            text: "Le lien de réinitialisation est invalide ou expiré.",
          })
          return
        }

        setCanReset(true)
      }
    }

    void initRecovery()

    return () => {
      isActive = false
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current)
      }
    }
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!canReset) {
      setStatus({
        tone: "error",
        text: "Veuillez ouvrir le lien reçu par email pour réinitialiser le mot de passe.",
      })
      return
    }

    if (!password || !confirmPassword) {
      setStatus({ tone: "error", text: "Veuillez saisir votre nouveau mot de passe." })
      return
    }

    if (password !== confirmPassword) {
      setStatus({ tone: "error", text: "Les mots de passe ne correspondent pas." })
      return
    }

    setIsSubmitting(true)
    setStatus(null)

    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        setStatus({ tone: "error", text: error.message })
        return
      }

      setStatus({
        tone: "success",
        text: "Mot de passe mis à jour. Redirection vers la connexion...",
      })
      setIsSuccess(true)
      // # Reason: Give feedback then send the user back to sign in.
      redirectTimerRef.current = setTimeout(() => router.replace("/login"), 1200)
    } catch (error) {
      console.error("Password update error:", error)
      setStatus({
        tone: "error",
        text: "Impossible de modifier le mot de passe.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      desktopIntro={
        <>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Nouveau mot de passe</h2>
          <p className="text-slate-600">Créez un mot de passe sécurisé pour votre compte</p>
        </>
      }
      mobileIntro={
        <>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Nouveau mot de passe</h2>
          <p className="text-slate-600">Choisissez un mot de passe sécurisé</p>
        </>
      }
      footerNote={
        <>
          Vous avez besoin d'un nouveau lien ?{" "}
          <Link
            href="/forgot-password"
            className="text-slate-700 hover:text-slate-900 underline underline-offset-2"
          >
            Renvoyer un email
          </Link>
          .
        </>
      }
    >
      <div className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900">Définir un mot de passe</h3>
          <p className="text-sm text-slate-600">
            Ouvrez le lien de récupération envoyé par email pour accéder à ce formulaire.
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

        {isSuccess ? (
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-slate-900">Mot de passe mis à jour</p>
              <p className="text-sm text-slate-600">Redirection vers la connexion...</p>
            </div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nouveau mot de passe</label>
              <Input
                type="password"
                autoComplete="new-password"
                placeholder="Nouveau mot de passe"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Confirmer le mot de passe
              </label>
              <Input
                type="password"
                autoComplete="new-password"
                placeholder="Confirmez le mot de passe"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-700">Sécurité du mot de passe</p>
              <div className="mt-2 grid gap-1">
                {passwordChecks.map((requirement) => {
                  const Icon = requirement.isMet ? CheckCircle2 : Circle
                  return (
                    <div
                      key={requirement.id}
                      className={`flex items-center gap-2 text-xs ${
                        requirement.isMet ? "text-emerald-600" : "text-slate-500"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{requirement.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !password || !confirmPassword}
            >
              {isSubmitting ? "Updating..." : "Update Password"}
            </Button>
          </form>
        )}
      </div>
    </AuthShell>
  )
}
