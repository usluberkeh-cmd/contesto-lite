import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProfileForm } from "@/components/profile/profile-form"
import { PasswordCard } from "@/components/profile/password-card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Informations personnelles | Contesto",
  description: "Gérez vos informations personnelles et vos préférences.",
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/login")
  }

  // Fetch or initialize profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, address, phone")
    .eq("id", user.id)
    .single()

  const safeProfile = profile ?? {
    first_name: null,
    last_name: null,
    address: null,
    phone: null,
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="size-4" />
        Retour au tableau de bord
      </Link>

      <h1 className="text-3xl font-bold text-foreground mb-2 text-balance">
        Informations personnelles
      </h1>
      <p className="text-muted-foreground mb-8 text-pretty">
        Gérez vos informations personnelles et vos préférences.
      </p>

      <div className="space-y-6">
        <ProfileForm profile={safeProfile} email={user.email ?? ""} />
        <PasswordCard />
      </div>
    </div>
  )
}
