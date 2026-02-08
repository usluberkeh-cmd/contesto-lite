"use client"

import { useState } from "react"
import Link from "next/link"
import type { FormEvent } from "react"
import { useRouter } from "next/navigation"
import type { SupabaseClient } from "@supabase/supabase-js"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { AuthStatus } from "@/components/auth/types"

type PasswordLoginFormProps = {
  supabase: SupabaseClient
  onStatus: (status: AuthStatus | null) => void
}

export function PasswordLoginForm({ supabase, onStatus }: PasswordLoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail || !password) {
      onStatus({ tone: "error", text: "Please enter your email and password." })
      return
    }

    setIsSubmitting(true)
    onStatus(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })

      if (error) {
        onStatus({ tone: "error", text: error.message })
        return
      }

      onStatus({ tone: "success", text: "Signed in successfully. Redirecting..." })
      router.replace("/dashboard")
    } catch (error) {
      console.error("Password login error:", error)
      onStatus({
        tone: "error",
        text: "Unable to sign in. Please check your credentials.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Email</label>
        <Input
          type="email"
          autoComplete="email"
          placeholder="you@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Password</label>
        <Input
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || !email.trim() || !password}
      >
        {isSubmitting ? "Signing in..." : "Sign in with password"}
      </Button>
      <div className="text-center">
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-slate-900 underline underline-offset-4"
        >
          Forgot Password?
        </Link>
      </div>
    </form>
  )
}
