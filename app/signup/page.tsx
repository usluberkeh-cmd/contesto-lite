"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle2, Circle, Mail, KeyRound, ArrowLeft } from "lucide-react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { AuthShell } from "@/components/auth/auth-shell"
import type { AuthStatus } from "@/components/auth/types"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
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

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
      .regex(/[A-Z]/, "Ajoutez au moins une majuscule.")
      .regex(/\d/, "Ajoutez au moins un chiffre.")
      .regex(/[^A-Za-z0-9]/, "Ajoutez au moins un caractère spécial."),
    confirmPassword: z
      .string()
      .min(1, "Veuillez confirmer votre mot de passe."),
    terms: z
      .boolean({
        required_error: "Veuillez accepter les conditions d'utilisation.",
      })
      .refine((value) => value, {
        message: "Veuillez accepter les conditions d'utilisation.",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  })

type PasswordFormValues = z.infer<typeof passwordSchema>

type SignupStep = "email" | "method" | "magic" | "password"

export default function SignupPage() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<AuthStatus | null>(null)
  const [step, setStep] = useState<SignupStep>("email")
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [magicSent, setMagicSent] = useState(false)
  const [isMagicSending, setIsMagicSending] = useState(false)
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const redirectTo = useMemo(() => {
    // # Reason: Ensure email confirmation links redirect correctly in all environments.
    if (process.env.NEXT_PUBLIC_APP_URL) {
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

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    mode: "onChange",
    defaultValues: {
      password: "",
      confirmPassword: "",
      terms: false,
    },
  })

  const passwordValue = form.watch("password") ?? ""
  const passwordChecks = PASSWORD_REQUIREMENTS.map((requirement) => ({
    ...requirement,
    isMet: requirement.test(passwordValue),
  }))

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          router.replace("/")
          return
        }
      } catch (error) {
        console.error("Session check error:", error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [supabase.auth, router])

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current)
      }
    }
  }, [])

  const normalizedEmail = email.trim().toLowerCase()
  const normalizedFullName = fullName.trim()

  const validateEmailStep = () => {
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setStatus({ tone: "error", text: "Veuillez saisir une adresse email valide." })
      return false
    }

    if (!normalizedFullName) {
      setStatus({ tone: "error", text: "Veuillez saisir votre nom complet." })
      return false
    }

    return true
  }

  const handleContinue = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus(null)

    if (!validateEmailStep()) return

    setStep("method")
  }

  const handleMagicLink = async () => {
    setStatus(null)
    if (!validateEmailStep()) {
      setStep("email")
      return
    }

    setIsMagicSending(true)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          // # Reason: Magic link signup should create the user if they do not exist.
          shouldCreateUser: true,
          data: {
            full_name: normalizedFullName,
          },
          emailRedirectTo: redirectTo,
        },
      })

      if (error) {
        setStatus({ tone: "error", text: error.message })
        return
      }

      setMagicSent(true)
      setStatus({ tone: "success", text: "Check your email for the magic link!" })
    } catch (error) {
      console.error("Magic link signup error:", error)
      setStatus({
        tone: "error",
        text: "Impossible d'envoyer le lien. Réessayez plus tard.",
      })
    } finally {
      setIsMagicSending(false)
    }
  }

  const onSubmitPassword = async (values: PasswordFormValues) => {
    setStatus(null)

    if (!validateEmailStep()) {
      setStep("email")
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: values.password,
        options: {
          data: {
            full_name: normalizedFullName,
          },
          emailRedirectTo: redirectTo,
        },
      })

      if (error) {
        setStatus({ tone: "error", text: error.message })
        return
      }

      if (!data.user) {
        setStatus({
          tone: "error",
          text: "Impossible de créer le compte pour le moment.",
        })
        return
      }

      setStatus({
        tone: "success",
        text: "Compte créé. Vérifiez votre email pour confirmer votre inscription.",
      })

      // # Reason: Give users a quick success confirmation before redirecting.
      redirectTimerRef.current = setTimeout(() => {
        router.replace("/signup/confirm")
      }, 1200)
    } catch (error) {
      console.error("Signup error:", error)
      setStatus({
        tone: "error",
        text: "Création de compte impossible. Réessayez plus tard.",
      })
    }
  }

  const steps = [
    { id: "email", label: "Email" },
    { id: "method", label: "Méthode" },
    { id: "finish", label: "Création" },
  ] as const
  const activeIndex = step === "email" ? 0 : step === "method" ? 1 : 2

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
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Créer un compte</h2>
          <p className="text-base text-slate-600">Choisissez votre méthode préférée</p>
        </>
      }
      mobileIntro={
        <>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Inscription</h2>
          <p className="text-base text-slate-600">Choisissez votre méthode préférée</p>
        </>
      }
      footerNote={
        <>
          En créant un compte, vous acceptez nos{" "}
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
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold text-slate-900">Inscription</h3>
            <p className="text-sm text-slate-600">Créez votre compte en quelques étapes.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            {steps.map((item, index) => {
              const isActive = index <= activeIndex
              return (
                <div key={item.id} className="flex items-center gap-2">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      isActive ? "bg-slate-900" : "bg-slate-300"
                    }`}
                  />
                  <span className={`text-xs ${isActive ? "text-slate-900" : "text-slate-400"}`}>
                    {item.label}
                  </span>
                </div>
              )
            })}
          </div>
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

        {step === "email" && (
          <form className="space-y-4" onSubmit={handleContinue}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nom complet</label>
              <Input
                type="text"
                autoComplete="name"
                placeholder="Votre nom et prénom"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </div>
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
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        )}

        {step === "method" && (
          <div className="space-y-4">
            <Button
              type="button"
              variant="ghost"
              className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
              onClick={() => setStep("email")}
            >
              <ArrowLeft className="h-4 w-4" />
              Modifier l'email
            </Button>

            <div className="grid gap-4">
              <button
                type="button"
                className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:shadow"
                onClick={() => {
                  setMagicSent(false)
                  setStep("magic")
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                    <Mail className="h-5 w-5 text-slate-700" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">Set up with Magic Link</p>
                    <p className="text-xs text-slate-600">
                      Aucune mot de passe. Recevez un lien sécurisé sur {normalizedEmail}.
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:shadow"
                onClick={() => setStep("password")}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                    <KeyRound className="h-5 w-5 text-slate-700" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">Set up with Password</p>
                    <p className="text-xs text-slate-600">
                      Utilisez un mot de passe pour vos prochaines connexions.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {step === "magic" && (
          <div className="space-y-4">
            <Button
              type="button"
              variant="ghost"
              className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
              onClick={() => setStep("method")}
            >
              <ArrowLeft className="h-4 w-4" />
              Changer de méthode
            </Button>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Magic Link</p>
              <p className="text-xs text-slate-600">
                Nous allons envoyer un lien sécurisé à {normalizedEmail}.
              </p>
            </div>

            <Button
              type="button"
              className="w-full"
              onClick={handleMagicLink}
              disabled={isMagicSending}
            >
              {isMagicSending ? "Envoi..." : "Send Magic Link"}
            </Button>

            {magicSent && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                <p className="font-medium">Check your email</p>
                <p className="text-xs text-emerald-700/80">
                  Ouvrez le lien reçu pour activer votre compte. Le lien expirera bientôt.
                </p>
              </div>
            )}
          </div>
        )}

        {step === "password" && (
          <div className="space-y-5">
            <Button
              type="button"
              variant="ghost"
              className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
              onClick={() => setStep("method")}
            >
              <ArrowLeft className="h-4 w-4" />
              Changer de méthode
            </Button>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Compte avec mot de passe</p>
              <p className="text-xs text-slate-600">
                Vous recevrez un email de confirmation après création.
              </p>
            </div>

            <Form {...form}>
              <form className="space-y-4" onSubmit={form.handleSubmit(onSubmitPassword)}>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="new-password"
                          placeholder="Votre mot de passe"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmer le mot de passe</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="new-password"
                          placeholder="Confirmez votre mot de passe"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem className="rounded-lg border border-slate-200 p-3">
                      <div className="flex items-start gap-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            // # Reason: Radix returns "indeterminate"; coerce to boolean for form state.
                            onCheckedChange={(checked) => field.onChange(checked === true)}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-medium text-slate-700">
                            J'accepte les{" "}
                            <Link href="/terms" className="underline underline-offset-4">
                              Conditions d'utilisation
                            </Link>{" "}
                            et la{" "}
                            <Link href="/privacy" className="underline underline-offset-4">
                              Politique de confidentialité
                            </Link>
                            .
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!form.formState.isValid || form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Création..." : "Créer un compte"}
                </Button>
              </form>
            </Form>
          </div>
        )}

        <p className="text-center text-sm text-slate-600">
          Vous avez déjà un compte ?{" "}
          <Link
            href="/login"
            className="font-medium text-slate-900 underline underline-offset-4"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
