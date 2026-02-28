"use client"

import { useEffect, useMemo, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  clearPendingProfileMerge,
  getPendingProfileMerge,
  isPendingProfileMergeExpired,
  savePendingProfileMerge,
} from "@/lib/client/pending-profile-merge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Loader2 } from "lucide-react"

const PROFILE_SETTINGS_NEXT_PATH = "/dashboard/settings/profile"
const PROFILE_EXISTING_ACCOUNT_DISCLAIMER =
  "Votre profil existant a été retrouvé. Vos informations ont été mises à jour."
const GUEST_EXISTING_ACCOUNT_INFO =
  "Un compte existe déjà avec cet email. Consultez votre messagerie pour vous connecter, puis nous mettrons à jour votre profil."
const NON_GUEST_EMAIL_CONFLICT_MESSAGE =
  "Vos informations ont été enregistrées, mais cette adresse email est déjà utilisée. Connectez-vous avec ce compte ou utilisez une autre adresse."

const optionalEmailSchema = z
  .string()
  .trim()
  .refine(
    (value) => value.length === 0 || z.string().email().safeParse(value).success,
    "Email invalide"
  )

const baseProfileSchema = z.object({
  first_name: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  last_name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  phone: z.string().optional(),
  address: z.string().optional(),
  email: optionalEmailSchema,
})

const mandatoryProfileSchema = baseProfileSchema.extend({
  phone: z
    .string()
    .refine(
      (value) => value.trim().length > 0,
      "Le numéro de téléphone est obligatoire."
    ),
})

type ProfileFormValues = z.infer<typeof baseProfileSchema>

interface ProfileFormProps {
  profile: {
    first_name: string | null
    last_name: string | null
    address: string | null
    phone: string | null
  }
  email: string
  isGuest: boolean
  mandatoryMode?: boolean
  redirectToOnSuccess?: string | null
}

const normalizeEmail = (value: string | null | undefined): string => {
  return value?.trim().toLowerCase() ?? ""
}

const toNullableTrimmed = (value: string | null | undefined): string | null => {
  if (typeof value !== "string") {
    return null
  }

  const trimmedValue = value.trim()
  return trimmedValue.length > 0 ? trimmedValue : null
}

const fillMissingWithPending = (
  currentValue: string | null | undefined,
  pendingValue: string | null | undefined
): string | null => {
  const normalizedCurrentValue = toNullableTrimmed(currentValue)
  if (normalizedCurrentValue) {
    return normalizedCurrentValue
  }

  return toNullableTrimmed(pendingValue)
}

const isExistingEmailConflictError = (message: string): boolean => {
  return /already registered|already exists|email.*(taken|exists|registered|already|in use)|duplicate|unique/i.test(
    message
  )
}

export function ProfileForm({
  profile,
  email,
  isGuest,
  mandatoryMode = false,
  redirectToOnSuccess = null,
}: ProfileFormProps) {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const hasAppliedPendingMergeRef = useRef(false)
  const validationSchema = useMemo(
    () => (mandatoryMode ? mandatoryProfileSchema : baseProfileSchema),
    [mandatoryMode]
  )
  const emailRedirectTo = useMemo(() => {
    const callbackPath = `/auth/callback?next=${encodeURIComponent(PROFILE_SETTINGS_NEXT_PATH)}`

    // # Reason: Auth confirmation links must resolve correctly in local and production environments.
    if (process.env.NEXT_PUBLIC_APP_URL) {
      const normalizedAppUrl = process.env.NEXT_PUBLIC_APP_URL.trim().replace(
        /\/+$/,
        ""
      )
      return `${normalizedAppUrl}${callbackPath}`
    }

    if (typeof window !== "undefined") {
      return `${window.location.origin}${callbackPath}`
    }

    return callbackPath
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(validationSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      first_name: profile.first_name ?? "",
      last_name: profile.last_name ?? "",
      address: profile.address ?? "",
      phone: profile.phone ?? "",
      email,
    },
  })

  useEffect(() => {
    if (hasAppliedPendingMergeRef.current) {
      return
    }

    hasAppliedPendingMergeRef.current = true
    let isMounted = true

    const applyPendingProfileMerge = async () => {
      const pendingMerge = getPendingProfileMerge()
      if (!pendingMerge) {
        return
      }

      if (isPendingProfileMergeExpired(pendingMerge)) {
        clearPendingProfileMerge()
        return
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user || user.is_anonymous) {
        return
      }

      const currentUserEmail = normalizeEmail(user.email)
      if (!currentUserEmail || currentUserEmail !== normalizeEmail(pendingMerge.targetEmail)) {
        return
      }

      const { data: existingProfile, error: existingProfileError } = await supabase
        .from("profiles")
        .select("first_name, last_name, address, phone")
        .eq("id", user.id)
        .maybeSingle()

      if (existingProfileError) {
        console.error("Impossible de récupérer le profil existant:", existingProfileError)
        return
      }

      const mergedFirstName = fillMissingWithPending(
        existingProfile?.first_name,
        pendingMerge.first_name
      )
      const mergedLastName = fillMissingWithPending(
        existingProfile?.last_name,
        pendingMerge.last_name
      )
      const mergedAddress = fillMissingWithPending(
        existingProfile?.address,
        pendingMerge.address
      )
      const mergedPhone = fillMissingWithPending(
        existingProfile?.phone,
        pendingMerge.phone
      )

      const hasChanges =
        mergedFirstName !== toNullableTrimmed(existingProfile?.first_name) ||
        mergedLastName !== toNullableTrimmed(existingProfile?.last_name) ||
        mergedAddress !== toNullableTrimmed(existingProfile?.address) ||
        mergedPhone !== toNullableTrimmed(existingProfile?.phone)

      if (!hasChanges) {
        clearPendingProfileMerge()
        return
      }

      const { error: mergeError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          first_name: mergedFirstName,
          last_name: mergedLastName,
          address: mergedAddress,
          phone: mergedPhone,
        },
        { onConflict: "id" }
      )

      if (mergeError) {
        console.error("Impossible de fusionner les données du profil:", mergeError)
        return
      }

      clearPendingProfileMerge()

      if (!isMounted) {
        return
      }

      reset({
        first_name: mergedFirstName ?? "",
        last_name: mergedLastName ?? "",
        address: mergedAddress ?? "",
        phone: mergedPhone ?? "",
        email: user.email?.trim() ?? "",
      })

      toast.success(PROFILE_EXISTING_ACCOUNT_DISCLAIMER)
    }

    void applyPendingProfileMerge()

    return () => {
      isMounted = false
    }
  }, [reset, supabase])

  const onSubmit = async (values: ProfileFormValues) => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      toast.error("Vous devez être connecté.")
      return
    }

    const normalizedFirstName = values.first_name.trim()
    const normalizedLastName = values.last_name.trim()
    const normalizedAddress = toNullableTrimmed(values.address)
    const normalizedPhone = toNullableTrimmed(values.phone)
    const requestedEmail = normalizeEmail(values.email)
    const currentEmail = normalizeEmail(user.email)

    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        first_name: normalizedFirstName,
        last_name: normalizedLastName,
        address: normalizedAddress,
        phone: normalizedPhone,
      },
      { onConflict: "id" }
    )

    if (error) {
      toast.error("Impossible de sauvegarder les modifications.")
      return
    }

    let emailFlowStatus: "none" | "updated" | "guest-merge" | "conflict" | "error" =
      "none"

    if (requestedEmail.length > 0 && requestedEmail !== currentEmail) {
      const { error: emailUpdateError } = await supabase.auth.updateUser(
        { email: requestedEmail },
        { emailRedirectTo }
      )

      if (emailUpdateError) {
        if (isExistingEmailConflictError(emailUpdateError.message)) {
          if (isGuest) {
            savePendingProfileMerge({
              targetEmail: requestedEmail,
              first_name: normalizedFirstName,
              last_name: normalizedLastName,
              address: normalizedAddress,
              phone: normalizedPhone,
              sourceUserId: user.id,
            })

            const { error: magicLinkError } = await supabase.auth.signInWithOtp({
              email: requestedEmail,
              options: {
                shouldCreateUser: false,
                emailRedirectTo,
              },
            })

            if (magicLinkError) {
              clearPendingProfileMerge()
              toast.error(
                "Impossible d'envoyer le lien de connexion. Veuillez réessayer."
              )
              emailFlowStatus = "error"
            } else {
              toast.info(GUEST_EXISTING_ACCOUNT_INFO)
              emailFlowStatus = "guest-merge"
            }
          } else {
            toast.error(NON_GUEST_EMAIL_CONFLICT_MESSAGE)
            emailFlowStatus = "conflict"
          }
        } else {
          toast.error(emailUpdateError.message)
          emailFlowStatus = "error"
        }
      } else {
        toast.success(
          "Vos informations ont été mises à jour. Vérifiez votre boîte email pour confirmer le changement d'adresse."
        )
        emailFlowStatus = "updated"
      }
    }

    if (emailFlowStatus === "none") {
      toast.success("Vos informations ont été mises à jour.")
    }

    if (mandatoryMode && redirectToOnSuccess) {
      // # Reason: Mandatory profile completion must return the user to resume pending fine submission.
      router.push(redirectToOnSuccess)
      return
    }

    if (emailFlowStatus === "conflict" || emailFlowStatus === "error") {
      return
    }

    reset({
      first_name: normalizedFirstName,
      last_name: normalizedLastName,
      address: normalizedAddress ?? "",
      phone: normalizedPhone ?? "",
      email: requestedEmail || user.email?.trim() || "",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Détails du profil</CardTitle>
        <CardDescription>
          Mettez à jour vos informations personnelles
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="last_name">
                Nom <span className="text-destructive">*</span>
              </Label>
              <Input
                id="last_name"
                type="text"
                placeholder="Dupont"
                aria-invalid={Boolean(errors.last_name)}
                className={errors.last_name ? "border-destructive focus-visible:ring-destructive" : ""}
                {...register("last_name")}
              />
              {errors.last_name?.message && (
                <p className="text-xs text-destructive">{errors.last_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="first_name">
                Prénom <span className="text-destructive">*</span>
              </Label>
              <Input
                id="first_name"
                type="text"
                placeholder="Jean"
                aria-invalid={Boolean(errors.first_name)}
                className={errors.first_name ? "border-destructive focus-visible:ring-destructive" : ""}
                {...register("first_name")}
              />
              {errors.first_name?.message && (
                <p className="text-xs text-destructive">{errors.first_name.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Textarea
              id="address"
              rows={3}
              placeholder={"123 Rue de la Paix\n75001 Paris"}
              {...register("address")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Numéro de téléphone{" "}
              {mandatoryMode && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+33 6 12 34 56 78"
              aria-invalid={Boolean(errors.phone)}
              className={errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}
              {...register("phone")}
            />
            {errors.phone?.message && (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="vous@email.com"
              aria-invalid={Boolean(errors.email)}
              className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
              {...register("email")}
            />
            {errors.email?.message && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {isGuest
                ? "Ajoutez un email pour retrouver plus facilement votre dossier."
                : "Un changement d'email nécessite une confirmation via un lien envoyé par email."}
            </p>
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Enregistrer les modifications
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
