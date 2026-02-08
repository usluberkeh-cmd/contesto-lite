"use client"

import { useActionState } from "react"
import { updateProfile, type ProfileState } from "@/app/dashboard/settings/profile/actions"
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

interface ProfileFormProps {
  profile: {
    first_name: string | null
    last_name: string | null
    address: string | null
    phone: string | null
  }
  email: string
}

export function ProfileForm({ profile, email }: ProfileFormProps) {
  const initialState: ProfileState = { status: "idle", message: "" }
  const [state, formAction, isPending] = useActionState(updateProfile, initialState)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Détails du profil</CardTitle>
        <CardDescription>
          Mettez à jour vos informations personnelles
        </CardDescription>
      </CardHeader>

      <form action={formAction}>
        <CardContent className="space-y-5">
          {state.status !== "idle" && (
            <div
              role="status"
              aria-live="polite"
              className={`rounded-lg border px-3 py-2 text-sm ${
                state.status === "success"
                  ? "border-primary/30 bg-primary/5 text-primary"
                  : "border-destructive/30 bg-destructive/5 text-destructive"
              }`}
            >
              {state.message}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="last_name">
                Nom <span className="text-destructive">*</span>
              </Label>
              <Input
                id="last_name"
                name="last_name"
                type="text"
                required
                minLength={2}
                placeholder="Dupont"
                defaultValue={profile.last_name ?? ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="first_name">
                Prénom <span className="text-destructive">*</span>
              </Label>
              <Input
                id="first_name"
                name="first_name"
                type="text"
                required
                minLength={2}
                placeholder="Jean"
                defaultValue={profile.first_name ?? ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Textarea
              id="address"
              name="address"
              rows={3}
              placeholder={"123 Rue de la Paix\n75001 Paris"}
              defaultValue={profile.address ?? ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Numéro de téléphone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+33 6 12 34 56 78"
              defaultValue={profile.phone ?? ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="bg-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              Pour changer votre email, contactez le support.
            </p>
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Enregistrer les modifications
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
