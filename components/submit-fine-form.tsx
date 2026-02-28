"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FileUpload } from "./file-upload";
import { AIAnalysisWrapper } from "./ai-analysis-wrapper";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { countPdfPagesFromFile } from "@/lib/pdf/page-count";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { isProfileComplete } from "@/lib/profile-completion";
import { buildLoginPathWithNext } from "@/lib/auth/next-path";
import {
  PROFILE_REQUIRED_REDIRECT_PATH,
  PROFILE_REQUIRED_REDIRECT_FALLBACK_PATH,
  SUBMIT_FINE_PATH,
  SUBMIT_FINE_RESUME_PATH,
} from "@/lib/submit-fine-flow";
import {
  clearPendingFineDraft,
  getPendingFineDraft,
  savePendingFineDraft,
} from "@/lib/client/pending-fine-draft";
import { buildFineDocumentPath } from "@/lib/storage/fine-document-path";

const fineSchema = z.object({
  additionalInfo: z.string().optional(),
});

type FineFormData = z.infer<typeof fineSchema>;
type UserProfile = {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
} | null;
type SubmissionInput = {
  userId: string;
  firstName: string;
  lastName: string;
  file: File;
  additionalInfo: string;
};
type SubmissionToastId = string | number;

class SubmissionToastHandledError extends Error {
  cause: unknown;

  constructor(message: string, cause: unknown) {
    super(message);
    this.name = "SubmissionToastHandledError";
    this.cause = cause;
  }
}

const getProfileNameParts = (
  profile: UserProfile,
): { firstName: string; lastName: string } | null => {
  const firstName = profile?.first_name?.trim() ?? "";
  const lastName = profile?.last_name?.trim() ?? "";
  if (firstName.length < 2 || lastName.length < 2) {
    return null;
  }

  return { firstName, lastName };
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);
const UNSUPPORTED_MOBILE_IMAGE_MIME_TYPES = new Set([
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
]);
const UNSUPPORTED_MOBILE_IMAGE_EXTENSIONS = new Set(["heic", "heif"]);
const LOGIN_TO_RESUME_SUBMIT_PATH = buildLoginPathWithNext(SUBMIT_FINE_RESUME_PATH);
const LOGIN_TO_SUBMIT_PATH = buildLoginPathWithNext(SUBMIT_FINE_PATH);
const UPLOAD_LOADING_TOAST_MESSAGE = "Téléversement de votre document en cours...";
const SUBMISSION_SUCCESS_TOAST_MESSAGE = "Dossier envoyé.";

const validateFineFile = async (file: File): Promise<boolean> => {
  const normalizedMimeType = file.type.toLowerCase();
  const fileExtension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const isUnsupportedMobileImage =
    UNSUPPORTED_MOBILE_IMAGE_MIME_TYPES.has(normalizedMimeType) ||
    UNSUPPORTED_MOBILE_IMAGE_EXTENSIONS.has(fileExtension);

  if (file.size > MAX_FILE_SIZE) {
    toast.error("La taille du fichier dépasse la limite de 10MB");
    return false;
  }

  if (isUnsupportedMobileImage) {
    toast.error("Format image non supporté (HEIC/HEIF). Utilisez JPG ou PNG.");
    return false;
  }

  if (!ALLOWED_MIME_TYPES.has(normalizedMimeType)) {
    if (normalizedMimeType.startsWith("image/")) {
      toast.error("Format image non supporté. Utilisez JPG ou PNG.");
      return false;
    }

    toast.error("Type de fichier non autorisé. Utilisez PDF, JPG ou PNG.");
    return false;
  }

  if (normalizedMimeType === "application/pdf") {
    try {
      const pageCount = await countPdfPagesFromFile(file);
      if (pageCount !== 1) {
        toast.error("Un seul PDF d'une page est accepté.");
        return false;
      }
    } catch (error) {
      console.error("[v0] PDF page count error:", error);
      toast.error("Impossible de lire le PDF. Envoyez un PDF d'une seule page.");
      return false;
    }
  }

  return true;
};

export function SubmitFineForm() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const hasAttemptedResumeRef = useRef(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldResumeSubmission = searchParams.get("resume_submission") === "1";

  const supabase = useMemo(() => createClient(), []);
  const { register, handleSubmit, reset } = useForm<FineFormData>({
    resolver: zodResolver(fineSchema),
  });

  const getAuthenticatedUser = useCallback(async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      const isMissingSession =
        userError.name === "AuthSessionMissingError" ||
        /auth session missing/i.test(userError.message);

      if (!isMissingSession) {
        console.error("[v0] User error:", userError);
        toast.error("Erreur lors de la récupération de l'utilisateur");
      }

      return null;
    }

    return user;
  }, [supabase]);

  const getUserProfile = useCallback(
    async (userId: string): Promise<UserProfile> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name, phone")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data;
    },
    [supabase],
  );

  const submitFineToStorageAndDatabase = useCallback(
    async (
      { userId, firstName, lastName, file, additionalInfo }: SubmissionInput,
      toastId?: SubmissionToastId,
    ) => {
      const filePath = buildFineDocumentPath({
        firstName,
        lastName,
        originalFileName: file.name,
      });

      const { error: uploadError } = await supabase.storage
        .from("fine-documents")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        console.error("[v0] File upload error:", uploadError);
        const message = "Erreur lors du téléchargement du fichier";
        if (toastId !== undefined) {
          toast.error(message, { id: toastId });
        } else {
          toast.error(message);
        }
        throw new SubmissionToastHandledError(message, uploadError);
      }

      setUploadedFilePath(filePath);

      const { data: insertedFine, error: insertError } = await supabase
        .from("fines")
        .insert({
          user_id: userId,
          file_url: filePath,
          file_name: file.name,
          file_size: file.size,
          extracted_text: "",
          user_notes: additionalInfo,
          status: "pending",
          created_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("[v0] Database insert error:", insertError);
        const message = "Erreur lors de la sauvegarde des données";
        if (toastId !== undefined) {
          toast.error(message, { id: toastId });
        } else {
          toast.error(message);
        }
        throw new SubmissionToastHandledError(message, insertError);
      }
      if (!insertedFine?.id) {
        const message = "Erreur lors de la sauvegarde des données";
        if (toastId !== undefined) {
          toast.error(message, { id: toastId });
        } else {
          toast.error(message);
        }
        throw new SubmissionToastHandledError(
          "Missing inserted fine id",
          new Error("Inserted fine id is missing"),
        );
      }

      try {
        const triggerResponse = await fetch("/api/fines/trigger-processing", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            fineId: insertedFine.id,
          }),
        });

        if (!triggerResponse.ok) {
          const responseBody = await triggerResponse.text();
          // # Reason: Processing failures are handled by back-office; user flow must remain successful once fine is stored.
          console.error("[v0] Processing trigger error:", {
            status: triggerResponse.status,
            body: responseBody,
            fineId: insertedFine.id,
          });
        }
      } catch (error) {
        console.error("[v0] Processing trigger request crashed:", {
          error,
          fineId: insertedFine.id,
        });
      }

      setSubmitSuccess(true);
      if (toastId !== undefined) {
        toast.success(SUBMISSION_SUCCESS_TOAST_MESSAGE, { id: toastId });
      } else {
        toast.success("Votre amende a été soumise avec succès!");
      }
    },
    [supabase],
  );

  const submitFineWithToast = useCallback(
    async (input: SubmissionInput) => {
      const toastId = toast.loading(UPLOAD_LOADING_TOAST_MESSAGE);

      try {
        await submitFineToStorageAndDatabase(input, toastId);
      } catch (error) {
        if (error instanceof SubmissionToastHandledError) {
          throw error;
        }

        // # Reason: Update the in-flight loading toast instead of stacking an extra generic error toast.
        toast.error("Une erreur est survenue", { id: toastId });
        throw new SubmissionToastHandledError(
          "Unhandled submission error",
          error,
        );
      }
    },
    [submitFineToStorageAndDatabase],
  );

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
  };

  const handlePreviewClick = async (): Promise<void> => {
    if (!uploadedFilePath) {
      toast.error("Aucun fichier téléchargé à prévisualiser.");
      return;
    }

    setIsGeneratingPreview(true);

    try {
      const { data, error } = await supabase.storage
        .from("fine-documents")
        .createSignedUrl(uploadedFilePath, 60);

      if (error || !data?.signedUrl) {
        throw error ?? new Error("Signed URL non générée");
      }

      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Erreur lors de la génération de l'URL signée:", error);
      toast.error("Impossible de générer l'aperçu du fichier.");
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleReturnHome = (): void => {
    reset();
    setUploadedFile(null);
    setSubmitSuccess(false);
    setUploadedFilePath(null);
    void clearPendingFineDraft().catch(() => undefined);
    router.push("/");
  };

  const redirectToMandatoryProfile = useCallback(() => {
    router.push(PROFILE_REQUIRED_REDIRECT_PATH);
  }, [router]);
  const redirectToMandatoryProfileFallback = useCallback(() => {
    router.push(PROFILE_REQUIRED_REDIRECT_FALLBACK_PATH);
  }, [router]);
  const trySavePendingDraft = useCallback(
    async (file: File, additionalInfo: string): Promise<boolean> => {
      try {
        await savePendingFineDraft({ file, additionalInfo });
        return true;
      } catch (error) {
        console.error("[v0] Draft persistence error:", error);
        toast.info("Nous n'avons pas pu conserver votre brouillon. Vous devrez retélécharger le document après cette étape.");
        return false;
      }
    },
    [],
  );

  useEffect(() => {
    if (
      !shouldResumeSubmission ||
      submitSuccess ||
      hasAttemptedResumeRef.current
    ) {
      return;
    }

    hasAttemptedResumeRef.current = true;

    const resumeSubmission = async () => {
      setIsSubmitting(true);

      try {
        const draft = await getPendingFineDraft();
        if (!draft) {
          toast.error(
            "Impossible de reprendre la soumission. Veuillez re-télécharger votre document.",
          );
          if (typeof window !== "undefined") {
            window.history.replaceState({}, "", SUBMIT_FINE_PATH);
          }
          return;
        }

        const user = await getAuthenticatedUser();
        if (!user) {
          router.replace(LOGIN_TO_RESUME_SUBMIT_PATH);
          return;
        }

        const profile = await getUserProfile(user.id);
        if (!isProfileComplete(profile)) {
          redirectToMandatoryProfile();
          return;
        }
        const profileNameParts = getProfileNameParts(profile);
        if (!profileNameParts) {
          redirectToMandatoryProfile();
          return;
        }

        if (!(await validateFineFile(draft.file))) {
          if (typeof window !== "undefined") {
            window.history.replaceState({}, "", SUBMIT_FINE_PATH);
          }
          return;
        }

        setUploadedFile(draft.file);
        await submitFineWithToast({
          userId: user.id,
          firstName: profileNameParts.firstName,
          lastName: profileNameParts.lastName,
          file: draft.file,
          additionalInfo: draft.additionalInfo,
        });
        await clearPendingFineDraft();

        // # Reason: Removing the query avoids accidental replays on refresh/back navigation.
        if (typeof window !== "undefined") {
          window.history.replaceState({}, "", SUBMIT_FINE_PATH);
        }
      } catch (error) {
        console.error("[v0] Resume submission error:", error);
        if (error instanceof SubmissionToastHandledError) {
          return;
        }
        toast.error("Impossible de reprendre la soumission.");
      } finally {
        setIsSubmitting(false);
      }
    };

    void resumeSubmission();
  }, [
    getAuthenticatedUser,
    getUserProfile,
    redirectToMandatoryProfile,
    router,
    shouldResumeSubmission,
    submitFineWithToast,
    submitSuccess,
  ]);

  const onSubmit = async (data: FineFormData) => {
    if (!uploadedFile) {
      toast.error("Veuillez télécharger votre avis de contravention");
      return;
    }

    if (!(await validateFineFile(uploadedFile))) {
      return;
    }

    setIsSubmitting(true);

    try {
      const additionalInfo = data.additionalInfo ?? "";
      const user = await getAuthenticatedUser();
      if (!user) {
        // # Reason: Preserve uploaded draft so users can authenticate and resume without re-uploading.
        const hasSavedDraft = await trySavePendingDraft(uploadedFile, additionalInfo);

        if (hasSavedDraft) {
          toast.info("Connectez-vous ou continuez en invité pour finaliser l'envoi.");
        }
        router.push(hasSavedDraft ? LOGIN_TO_RESUME_SUBMIT_PATH : LOGIN_TO_SUBMIT_PATH);
        return;
      }

      const profile = await getUserProfile(user.id);
      if (!isProfileComplete(profile)) {
        const hasSavedDraft = await trySavePendingDraft(uploadedFile, additionalInfo);
        if (hasSavedDraft) {
          redirectToMandatoryProfile();
          return;
        }
        redirectToMandatoryProfileFallback();
        return;
      }
      const profileNameParts = getProfileNameParts(profile);
      if (!profileNameParts) {
        const hasSavedDraft = await trySavePendingDraft(uploadedFile, additionalInfo);
        if (hasSavedDraft) {
          redirectToMandatoryProfile();
          return;
        }
        redirectToMandatoryProfileFallback();
        return;
      }

      await submitFineWithToast({
        userId: user.id,
        firstName: profileNameParts.firstName,
        lastName: profileNameParts.lastName,
        file: uploadedFile,
        additionalInfo,
      });
    } catch (error) {
      console.error("[v0] Submission error:", error);
      if (error instanceof SubmissionToastHandledError) {
        return;
      }
      toast.error("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <Card className="border-success/20 bg-success/5">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle2 className="mb-4 h-16 w-16 text-success" />
          <h3 className="mb-2 text-2xl font-bold text-foreground">
            Soumission réussie!
          </h3>
          <p className="text-center text-muted-foreground">
            Votre amende a été soumise avec succès. Notre équipe va analyser
            votre dossier et vous contacter sous 24-48h.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-6 bg-transparent"
            onClick={handlePreviewClick}
            disabled={isGeneratingPreview || !uploadedFilePath}
          >
            {isGeneratingPreview
              ? "Génération de l'aperçu..."
              : "Prévisualiser le document"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="mt-6 bg-transparent"
            onClick={handleReturnHome}
          >
            Retour à l&apos;accueil
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <AIAnalysisWrapper>
        <FileUpload
          onFileUpload={handleFileUpload}
          onFileRemove={() => setUploadedFile(null)}
        />
      </AIAnalysisWrapper>

      <Card>
        <CardHeader>
          <CardTitle>2. Informations complementaires</CardTitle>
          <CardDescription>
            Ajoutez des details sur votre contravention (optionnel)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="additionalInfo">
              Informations supplementaires (optionnel)
            </Label>
            <Textarea
              id="additionalInfo"
              placeholder="Decrivez les circonstances de l'incident, ajoutez des details pertinents..."
              rows={4}
              {...register("additionalInfo")}
            />
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!uploadedFile || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Soumission en cours...
          </>
        ) : (
          "Soumettre mon amende"
        )}
      </Button>
    </form>
  );
}
