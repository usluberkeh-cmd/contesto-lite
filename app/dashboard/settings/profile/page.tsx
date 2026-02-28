import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile/profile-form";
import { PasswordCard } from "@/components/profile/password-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { sanitizeNextPath } from "@/lib/auth/next-path";
import {
  SUBMIT_FINE_PATH,
  SUBMIT_FINE_RESUME_PATH,
} from "@/lib/submit-fine-flow";
import { ArrowLeft, CircleAlert } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Informations personnelles | Contesto",
  description: "Gérez vos informations personnelles et vos préférences.",
};

type ProfilePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const supabase = await createClient();
  const resolvedSearchParams = await searchParams;
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Fetch or initialize profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, address, phone")
    .eq("id", user.id)
    .single();

  const safeProfile = profile ?? {
    first_name: null,
    last_name: null,
    address: null,
    phone: null,
  };
  const isGuest = Boolean(user.is_anonymous);

  const requiredParam = resolvedSearchParams?.required;
  const originParam = resolvedSearchParams?.origin;
  const resumeSubmissionParam = resolvedSearchParams?.resume_submission;
  const nextParam = resolvedSearchParams?.next;
  const safeMandatoryNextPath = (() => {
    if (typeof nextParam !== "string") {
      return null;
    }

    // # Reason: Mandatory submit flow fallback should only navigate to internal, sanitized paths.
    const sanitizedNextPath = sanitizeNextPath(nextParam);
    return sanitizedNextPath === "/" ? SUBMIT_FINE_PATH : sanitizedNextPath;
  })();

  const isMandatorySubmitFlow =
    requiredParam === "1" && originParam === "submit-fine";
  const redirectToOnSuccess =
    isMandatorySubmitFlow && resumeSubmissionParam === "1"
      ? SUBMIT_FINE_RESUME_PATH
      : isMandatorySubmitFlow && safeMandatoryNextPath
        ? safeMandatoryNextPath
      : null;

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

      {isMandatorySubmitFlow && (
        <Alert className="mb-6 border-primary/20 bg-primary/5">
          <CircleAlert className="size-4 text-primary" />
          <AlertDescription className="text-base">
            Nous recueillons vos informations afin de traiter votre demande et
            d’assurer l’exécution de votre contrat.{" "}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <ProfileForm
          profile={safeProfile}
          email={user.email ?? ""}
          isGuest={isGuest}
          mandatoryMode={isMandatorySubmitFlow}
          redirectToOnSuccess={redirectToOnSuccess}
        />
        {!isGuest && <PasswordCard />}
      </div>
    </div>
  );
}
