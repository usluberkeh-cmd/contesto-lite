"use client";

import { useState } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

//React Hook Form = helps manage form inputs and errors.

//zod schema for form validation.
const fineSchema = z.object({
  additionalInfo: z.string().optional(),
});

type FineFormData = z.infer<typeof fineSchema>;

const buildUserScopedPath = (userId: string, fileName: string) => {
  // # Reason: Storage RLS requires uploads to live under the user's folder (userId/filename).
  return `${userId}/${fileName}`;
};

// react functional component
export function SubmitFineForm() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  //The initial value is null. The state can be either a string (file path) or null.
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  //This hook should not be called inside an handler
  const supabase = useMemo(() => createClient(), []);

  //Sets up react hook form with zod validation
  const {
    register,
    //register attaches inputs to the form

    handleSubmit,
    //wraps onSubmit callback and only calls it when validation passes.

    formState: { errors },
    //exposes validation errors for each field

    reset,
    // clears the form after a successful submission

    //wires the form to the fineSchema rules
  } = useForm<FineFormData>({
    resolver: zodResolver(fineSchema),
  });

  //File upload handler
  // Receives file from <FileUpload />
  const handleFileUpload = (file: File, text: string) => {
    setUploadedFile(file);
    setExtractedText(text);
  };

  /**
   * Generate a short-lived signed URL for the uploaded file and open it in a new tab.
   *
   * Args:
   *   None
   *
   * Returns:
   *   Promise<void>: Resolves when the preview attempt completes.
   *
   * Raises:
   *   Error: If the signed URL cannot be created.
   */

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
      //signed URL valid for 60 seconds

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

  const router = useRouter();

  /**
   * Reset the submission state and navigate to the home page.
   *
   * Args:
   *   None
   *
   * Returns:
   *   void
   */
  const handleReturnHome = (): void => {
    reset(); //resets the form to its initial state
    setUploadedFile(null); //clears the uploaded file
    setExtractedText(""); //clears the extracted text
    setSubmitSuccess(false); //removes the success state so the form returns to its initial ready-to-submit view.
    setUploadedFilePath(null); //clears the uploaded file path
    router.push("/"); //navigates to the home page
  };

  // This is another handler. And it's a callback as it's defined as async function
  const onSubmit = async (data: FineFormData) => {
    if (!uploadedFile) {
      toast.error("Veuillez télécharger votre avis de contravention");
      return;
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];

    if (uploadedFile.size > MAX_FILE_SIZE) {
      toast.error("La taille du fichier dépasse la limite de 10MB");
      return;
    }

    if (!ALLOWED_MIME_TYPES.includes(uploadedFile.type)) {
      toast.error("Type de fichier non autorisé");
      return;
    }

    setIsSubmitting(true);

    // Get user from Supabase Auth.
    // Runs only when a user is autheticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) {
      console.error("[v0] User error:", userError);
      toast.error("Erreur lors de la récupération de l'utilisateur");
      setIsSubmitting(false);
      return;
    }

    if (!user) {
      console.error("[v0] User not found");
      toast.error("Utilisateur non trouvé");
      setIsSubmitting(false);
      return;
    }

    try {
      // Upload file to Supabase Storage
      const fileExt = uploadedFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;
      const filePath = buildUserScopedPath(user.id, fileName);

      // returns a promise
      const { error: uploadError } = await supabase.storage
        .from("fine-documents") //This returns a bucket-specific object
        .upload(filePath, uploadedFile, {
          //This is the funciton we're calling/awaiting

          //cacheControl: "3600", means the file will be cached for 1 hour
          cacheControl: "3600",

          //upsert: false, means the file will not be overwritten if it already exists
          upsert: false,

          contentType: uploadedFile.type,
        });

      if (uploadError) {
        console.error("[v0] File upload error:", uploadError);
        toast.error("Erreur lors du téléchargement du fichier");
        return;
      }

      setUploadedFilePath(filePath); // Store the uploaded file path for preview

      // TODO: Modify that part according to your needs
      // Save fine data to database
      const { error: insertError } = await supabase.from("fines").insert({
        //This returns a table-specific object

        user_id: user.id,

        file_url: filePath, //Storing the stable storage path lets me generate a signed URL later
        // We store the path instead of a full URL to avoid exposing the storage URL directly.

        file_name: uploadedFile.name,
        file_size: uploadedFile.size,

        extracted_text: extractedText,

        user_notes: data.additionalInfo || "",

        status: "pending",
        created_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error("[v0] Database insert error:", insertError);
        toast.error("Erreur lors de la sauvegarde des données");
        return;
      }

      setSubmitSuccess(true);
      toast.success("Votre amende a été soumise avec succès!");
    } catch (error) {
      console.error("[v0] Submission error:", error);
      toast.error("Une erreur est survenue"); //shows an error message to the user
    } finally {
      setIsSubmitting(false); //sets the submitting state to false
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
            Retour à l'accueil
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
          onExtractionStart={() => setIsExtracting(true)}
          onExtractionEnd={() => setIsExtracting(false)}
        />

        {isExtracting && (
          <Alert className="border-primary/20 bg-primary/5">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <AlertDescription>
              Extraction du texte en cours... Cela peut prendre quelques
              secondes.
            </AlertDescription>
          </Alert>
        )}

        {extractedText && !isExtracting && (
          <div>
            <Label className="mb-2 block text-sm font-medium">
              Texte extrait de votre document
            </Label>
            <div className="max-h-40 overflow-y-auto rounded-xl border border-border bg-grey-50 p-4">
              <p className="whitespace-pre-wrap text-sm text-foreground">
                {extractedText}
              </p>
            </div>
          </div>
        )}
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
        disabled={!uploadedFile || isSubmitting || isExtracting}
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
