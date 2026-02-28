"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";

type AuthShellProps = {
  desktopIntro: ReactNode;
  mobileIntro: ReactNode;
  children: ReactNode;
  footerNote?: ReactNode;
  desktopPanel?: ReactNode;
};

export function AuthShell({
  desktopIntro,
  mobileIntro,
  children,
  footerNote,
  desktopPanel,
}: AuthShellProps) {
  const defaultDesktopPanel = (
    <>
      <div className="relative z-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-16"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Retour à l&apos;accueil</span>
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <img
            src="/images/contesto-logo-transparent.png"
            alt="Contesto"
            width={160}
            height={44}
            className="h-10 w-auto brightness-0 invert"
          />
        </div>

        <h1 className="text-4xl font-bold text-white mb-4 leading-tight text-balance">
          Contestez vos amendes radar en toute simplicité
        </h1>
        <p className="text-lg text-emerald-200/80 text-pretty">
          Rejoignez des milliers d&apos;automobilistes qui font confiance à
          notre expertise juridique.
        </p>

        <div className="flex items-start gap-4 mt-8">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
            <Scale className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">
              Expertise juridique
            </h3>
            <p className="text-emerald-200/60 text-sm">
              Analyse approfondie par des professionnels du droit routier.
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 space-y-6" />
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:flex lg:w-[40%] bg-emerald-950 flex-col justify-between p-10 relative overflow-hidden h-screen sticky top-0">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {desktopPanel ?? defaultDesktopPanel}

        {/* <div className="relative z-10 border-t border-slate-700 pt-8">
          <blockquote className="text-slate-300 italic">
            "Service impeccable, mon amende de 135€ a été annulée en moins de 3 semaines."
          </blockquote>
          <p className="text-slate-500 text-sm mt-2">— Marie L., Lyon</p>
        </div> */}
      </div>

      <div className="flex-1 flex flex-col bg-muted/30 h-screen overflow-hidden">
        <div className="lg:hidden p-4 flex items-center justify-between bg-card border-b border-border">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Retour</span>
          </Link>
          <div className="flex items-center gap-2">
            <img
              src="/images/contesto-logo-transparent.png"
              alt="Contesto"
              width={120}
              height={34}
              className="h-8 w-auto"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="w-full max-w-lg lg:max-w-xl mx-auto flex flex-col justify-center min-h-full">
            <div className="hidden lg:block text-center mb-8">
              {desktopIntro}
            </div>
            <div className="lg:hidden text-center mb-8">{mobileIntro}</div>

            <div className="bg-card rounded-xl shadow-sm border border-border p-6 sm:p-8">
              {children}
            </div>

            {footerNote && (
              <div className="text-center text-xs text-muted-foreground mt-6 px-4">
                {footerNote}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 text-center text-xs text-muted-foreground border-t border-border bg-card/90">
          © {new Date().getFullYear()} Contesto. Tous droits réservés.
        </div>
      </div>
    </div>
  );
}
