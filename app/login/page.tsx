"use client";

import { useMemo, useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { PasswordLoginForm } from "@/components/auth/password-login-form";
import type { AuthStatus } from "@/components/auth/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resolvePostAuthPathForResumeFlow } from "@/lib/auth/post-auth-redirect";
import { sanitizeNextPath } from "@/lib/auth/next-path";
import { createClient } from "@/lib/supabase/client";

const GUEST_UNAVAILABLE_MESSAGE =
  "Le mode invité est indisponible pour le moment. Veuillez utiliser une méthode de connexion classique.";
const GUEST_SERVER_ISSUE_MESSAGE =
  "Le mode invité est temporairement indisponible à cause d'un incident technique. Veuillez utiliser une méthode de connexion classique.";

export default function LoginPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(
    () => sanitizeNextPath(searchParams.get("next")),
    [searchParams],
  );
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<AuthStatus | null>(null);
  const [magicEmail, setMagicEmail] = useState("");
  const [isMagicSending, setIsMagicSending] = useState(false);
  const [isGuestSigningIn, setIsGuestSigningIn] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const isResolvingRedirectRef = useRef(false);
  const hasRedirectedRef = useRef(false);
  const redirectTo = useMemo(() => {
    const callbackPath = `/auth/callback?next=${encodeURIComponent(nextPath)}`;

    // # Reason: Ensure OAuth + magic-link redirects work in local and production environments.
    if (process.env.NEXT_PUBLIC_APP_URL) {
      // # Reason: Normalize env URL to avoid double slashes or trailing spaces breaking allowlisted redirects.
      const normalizedAppUrl = process.env.NEXT_PUBLIC_APP_URL.trim().replace(
        /\/+$/,
        "",
      );
      return `${normalizedAppUrl}${callbackPath}`;
    }
    if (typeof window !== "undefined") {
      return `${window.location.origin}${callbackPath}`;
    }
    return callbackPath;
  }, [nextPath]);
  const statusClasses = {
    error: "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300",
    success:
      "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    info: "border-border bg-muted/60 text-muted-foreground",
  } satisfies Record<AuthStatus["tone"], string>;

  const navigateAfterAuth = useCallback(
    async (authenticatedUserId?: string) => {
      if (hasRedirectedRef.current || isResolvingRedirectRef.current) {
        return;
      }

      isResolvingRedirectRef.current = true;

      try {
        const destination = await resolvePostAuthPathForResumeFlow({
          supabase,
          requestedNextPath: nextPath,
          fallbackPath: nextPath,
          authenticatedUserId,
        });

        hasRedirectedRef.current = true;
        router.replace(destination);
      } catch (error) {
        console.error("Post-auth redirect resolution failed:", error);
        isResolvingRedirectRef.current = false;
      }
    },
    [supabase, nextPath, router],
  );

  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timer = setInterval(() => {
      setCooldownSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          void navigateAfterAuth(session.user.id);
          return;
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setLoading(false);
      }
    };

    void checkSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        void navigateAfterAuth(session.user.id);
      } else if (event === "SIGNED_OUT") {
        hasRedirectedRef.current = false;
        isResolvingRedirectRef.current = false;
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, navigateAfterAuth]);

  const handleMagicLinkSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (cooldownSeconds > 0) {
      setStatus({
        tone: "error",
        text: `Veuillez patienter ${cooldownSeconds} secondes avant de réessayer.`,
      });
      return;
    }

    const normalizedEmail = magicEmail.trim().toLowerCase();
    if (!normalizedEmail) {
      setStatus({
        tone: "error",
        text: "Veuillez saisir une adresse email valide.",
      });
      return;
    }

    setIsMagicSending(true);
    setStatus(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        if (error.status === 429 || /rate limit/i.test(error.message)) {
          setCooldownSeconds(60);
          setStatus({
            tone: "error",
            text: "Trop de demandes. Réessayez dans 60 secondes.",
          });
          return;
        }

        setStatus({ tone: "error", text: error.message });
        return;
      }

      setStatus({
        tone: "success",
        text: "Consultez votre email pour le lien magique.",
      });
    } catch (error) {
      console.error("Magic link error:", error);
      setStatus({
        tone: "error",
        text: "Impossible d'envoyer le lien. Réessayez plus tard.",
      });
    } finally {
      setIsMagicSending(false);
    }
  };

  const handleContinueAsGuest = async () => {
    setStatus(null);
    setIsGuestSigningIn(true);

    try {
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        console.error("Anonymous auth error:", error);
        const isServerIssue = /database error creating anonymous user/i.test(
          error.message,
        );
        const isUnavailable = /anonymous|provider|not enabled|disabled/i.test(
          error.message,
        );
        setStatus({
          tone: "error",
          text: isServerIssue
            ? GUEST_SERVER_ISSUE_MESSAGE
            : isUnavailable
              ? GUEST_UNAVAILABLE_MESSAGE
              : error.message,
        });
        return;
      }

      await navigateAfterAuth(data.user?.id);
    } catch (error) {
      console.error("Anonymous auth unexpected error:", error);
      setStatus({
        tone: "error",
        text: GUEST_UNAVAILABLE_MESSAGE,
      });
    } finally {
      setIsGuestSigningIn(false);
    }
  };

  // Show loading state while checking session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-border border-t-foreground rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Vérification de la session...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthShell
      desktopPanel={
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-12"
            >
              <ArrowLeft className="size-4" />
              <span className="text-sm font-medium">
                Retour à l&apos;accueil
              </span>
            </Link>

            <img
              src="/images/contesto-logo-transparent.png"
              alt="Contesto"
              width={160}
              height={44}
              className="h-10 w-auto brightness-0 invert mb-8"
            />

            <h1 className="text-4xl font-bold text-white mb-4 leading-tight text-balance">
              Continuez votre depot, meme sans compte
            </h1>
            <p className="text-lg text-emerald-200/80 text-pretty">
              Vous pouvez poursuivre en invite, puis completer vos informations
              personnelles pour finaliser votre dossier.
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/5 p-6 space-y-3 flex-shrink-0">
            <h3 className="text-lg font-semibold text-white">
              Continuer en tant qu&apos;invite
            </h3>
            <p className="text-sm text-emerald-200/60">
              Cette option vous permet de reprendre immediatement votre
              soumission.
            </p>
            <Button
              type="button"
              className="w-full bg-white text-emerald-950 hover:bg-white/90"
              onClick={handleContinueAsGuest}
              disabled={isGuestSigningIn}
            >
              {isGuestSigningIn
                ? "Connexion invite..."
                : "Continuer en tant qu'invite"}
            </Button>
          </div>
        </div>
      }
      desktopIntro={
        <>
          <h2 className="text-4xl font-bold text-foreground mb-3">Welcome</h2>
          <p className="text-base text-muted-foreground">
            Connectez-vous pour accéder à votre espace
          </p>
        </>
      }
      mobileIntro={
        <>
          <h2 className="text-3xl font-bold text-foreground mb-2">Welcome</h2>
          <p className="text-base text-muted-foreground">
            Accédez à votre espace de contestation
          </p>
        </>
      }
      footerNote={
        <>
          En vous connectant, vous acceptez nos{" "}
          <Link
            href="/terms"
            className="text-foreground hover:text-primary underline underline-offset-2"
          >
            Conditions d&apos;utilisation
          </Link>{" "}
          et notre{" "}
          <Link
            href="/privacy"
            className="text-foreground hover:text-primary underline underline-offset-2"
          >
            Politique de confidentialité
          </Link>
          .
        </>
      }
    >
      <div className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold text-foreground">Connexion</h3>
          <p className="text-sm text-muted-foreground">
            Choisissez la méthode la plus simple pour vous connecter.
          </p>
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

        <div className="space-y-2 lg:hidden">
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={handleContinueAsGuest}
            disabled={isGuestSigningIn}
          >
            {isGuestSigningIn
              ? "Connexion invité..."
              : "Continuer en tant qu'invité"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Vous pourrez compléter votre compte ultérieurement.
          </p>
        </div>

        <div className="space-y-6">
          <OAuthButtons
            supabase={supabase}
            redirectTo={redirectTo}
            onStatus={setStatus}
          />

          <div className="flex items-center gap-3 text-xs uppercase text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            Or sign in with email link
            <span className="h-px flex-1 bg-border" />
          </div>

          <form className="space-y-3" onSubmit={handleMagicLinkSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                type="email"
                autoComplete="email"
                placeholder="you@email.com"
                value={magicEmail}
                onChange={(event) => setMagicEmail(event.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={
                isMagicSending || !magicEmail.trim() || cooldownSeconds > 0
              }
            >
              {isMagicSending
                ? "Envoi..."
                : cooldownSeconds > 0
                  ? `Réessayez dans ${cooldownSeconds}s`
                  : "Send Magic Link"}
            </Button>
          </form>
        </div>

        <Accordion
          type="single"
          collapsible
          className="rounded-xl border border-border"
        >
          <AccordionItem value="password" className="border-none">
            <AccordionTrigger className="px-4 py-4 text-sm font-semibold text-foreground hover:no-underline">
              Sign in with email & password
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <PasswordLoginForm
                supabase={supabase}
                onStatus={setStatus}
                onSignedIn={navigateAfterAuth}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-foreground hover:text-primary underline underline-offset-4"
          >
            Sign up
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
