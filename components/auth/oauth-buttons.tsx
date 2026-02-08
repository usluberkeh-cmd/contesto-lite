"use client"

import { useState } from "react"
import type { Provider, SupabaseClient } from "@supabase/supabase-js"

import { Button } from "@/components/ui/button"
import type { AuthStatus } from "@/components/auth/types"

const OAUTH_PROVIDERS: Array<{ id: Provider; label: string }> = [
  { id: "google", label: "Google" },
  { id: "facebook", label: "Facebook" },
]

type OAuthButtonsProps = {
  supabase: SupabaseClient
  redirectTo: string
  onStatus: (status: AuthStatus | null) => void
}

export function OAuthButtons({ supabase, redirectTo, onStatus }: OAuthButtonsProps) {
  const [activeProvider, setActiveProvider] = useState<Provider | null>(null)

  const handleOAuth = async (provider: Provider) => {
    setActiveProvider(provider)
    onStatus(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
      },
    })

    if (error) {
      setActiveProvider(null)
      onStatus({ tone: "error", text: error.message })
      return
    }
  }

  return (
    <div className="space-y-3">
      {OAUTH_PROVIDERS.map((provider) => (
        <Button
          key={provider.id}
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => handleOAuth(provider.id)}
          disabled={activeProvider !== null}
        >
          {activeProvider === provider.id
            ? `Connexion ${provider.label}...`
            : `Continuer avec ${provider.label}`}
        </Button>
      ))}
    </div>
  )
}
