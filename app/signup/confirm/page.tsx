"use client"

import Link from "next/link"

import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"

export default function SignupConfirmPage() {
  return (
    <AuthShell
      desktopIntro={
        <>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Confirmez votre email</h2>
          <p className="text-slate-600">
            Un lien vient d'être envoyé pour activer votre compte.
          </p>
        </>
      }
      mobileIntro={
        <>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Confirmation email</h2>
          <p className="text-slate-600">Vérifiez votre messagerie pour continuer.</p>
        </>
      }
      footerNote={
        <>
          Besoin d'un nouveau lien ? Retournez sur la page d'inscription.
        </>
      }
    >
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-900">Vérifiez votre boîte mail</h3>
          <p className="text-sm text-slate-600">
            Cliquez sur le lien de confirmation pour activer votre compte.
          </p>
        </div>

        <Button asChild className="w-full">
          <Link href="/login">Aller à la connexion</Link>
        </Button>

        <p className="text-xs text-slate-500">
          Pensez à vérifier vos spams si vous ne voyez pas l'email.
        </p>
      </div>
    </AuthShell>
  )
}
