"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type ProfileState = {
  status: "idle" | "success" | "error"
  message: string
}

export async function updateProfile(
  _prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { status: "error", message: "Vous devez être connecté." }
  }

  const firstName = formData.get("first_name") as string
  const lastName = formData.get("last_name") as string
  const address = formData.get("address") as string
  const phone = formData.get("phone") as string

  // Validation
  if (!firstName || firstName.trim().length < 2) {
    return {
      status: "error",
      message: "Le prénom doit contenir au moins 2 caractères.",
    }
  }
  if (!lastName || lastName.trim().length < 2) {
    return {
      status: "error",
      message: "Le nom doit contenir au moins 2 caractères.",
    }
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      address: address?.trim() || null,
      phone: phone?.trim() || null,
    },
    { onConflict: "id" }
  )

  if (error) {
    return {
      status: "error",
      message: "Impossible de sauvegarder les modifications.",
    }
  }

  revalidatePath("/dashboard/settings/profile")
  return { status: "success", message: "Vos informations ont été mises à jour." }
}
