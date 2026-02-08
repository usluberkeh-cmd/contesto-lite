"use client"

import { useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, Lock } from "lucide-react"

export function PasswordCard() {
  const supabase = useMemo(() => createClient(), [])
  const [open, setOpen] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [status, setStatus] = useState<{
    tone: "success" | "error"
    text: string
  } | null>(null)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus(null)

    if (newPassword.length < 6) {
      setStatus({
        tone: "error",
        text: "Le mot de passe doit contenir au moins 6 caractères.",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      setStatus({
        tone: "error",
        text: "Les mots de passe ne correspondent pas.",
      })
      return
    }

    setIsUpdating(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        setStatus({ tone: "error", text: error.message })
        return
      }

      setStatus({
        tone: "success",
        text: "Mot de passe mis à jour avec succès.",
      })
      setNewPassword("")
      setConfirmPassword("")

      setTimeout(() => {
        setOpen(false)
        setStatus(null)
      }, 1500)
    } catch {
      setStatus({
        tone: "error",
        text: "Impossible de mettre à jour le mot de passe.",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sécurité</CardTitle>
        <CardDescription>Gérez votre mot de passe</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <Lock className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Mot de passe
              </p>
              <p className="text-sm text-muted-foreground tracking-wider">
                {"••••••••"}
              </p>
            </div>
          </div>

          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setStatus(null); setNewPassword(""); setConfirmPassword("") } }}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Changer
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Changer le mot de passe</DialogTitle>
                <DialogDescription>
                  Entrez votre nouveau mot de passe ci-dessous.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleChangePassword} className="space-y-4">
                {status && (
                  <div
                    role="status"
                    aria-live="polite"
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      status.tone === "success"
                        ? "border-primary/30 bg-primary/5 text-primary"
                        : "border-destructive/30 bg-destructive/5 text-destructive"
                    }`}
                  >
                    {status.text}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="new-password">Nouveau mot de passe</Label>
                  <Input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Au moins 6 caractères"
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">
                    Confirmer le mot de passe
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Retapez le mot de passe"
                    required
                    minLength={6}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating && (
                      <Loader2 className="size-4 animate-spin" />
                    )}
                    Mettre à jour
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
