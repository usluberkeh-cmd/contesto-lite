"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Camera, File, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Tesseract from "tesseract.js";
import { toast } from "sonner";

interface FileUploadProps {
  onFileUpload: (file: File, extractedText: string) => void;
  onExtractionStart?: () => void;
  onExtractionEnd?: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
};

export function FileUpload({
  onFileUpload,
  onExtractionStart,
  onExtractionEnd,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const extractTextFromImage = async (file: File): Promise<string> => {
    try {
      const result = await Tesseract.recognize(file, "fra", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            console.log(`[v0] OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });
      return result.data.text;
    } catch (error) {
      console.error("[v0] OCR extraction error:", error);
      throw new Error("Erreur lors de l'extraction du texte");
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    // For PDFs, we'll convert to image first, then use OCR
    // In a production environment, you might use pdf.js for better text extraction
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // Simple text extraction - in production, use proper PDF parser
          const text =
            "PDF text extraction - implement with pdf.js in production";
          resolve(text);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () =>
        reject(new Error("Erreur lors de la lecture du fichier"));
      reader.readAsDataURL(file);
    });
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    onExtractionStart?.();

    try {
      let extractedText = "";

      if (file.type === "application/pdf") {
        extractedText = await extractTextFromPDF(file);
      } else if (file.type.startsWith("image/")) {
        extractedText = await extractTextFromImage(file);
      }

      onFileUpload(file, extractedText);
      toast.success("Fichier téléchargé et analysé avec succès");
    } catch (err) {
      console.error("[v0] File processing error:", err);
      setError("Erreur lors du traitement du fichier");
      toast.error("Erreur lors du traitement du fichier");
    } finally {
      setIsProcessing(false);
      onExtractionEnd?.();
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError("");

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.file.size > MAX_FILE_SIZE) {
          setError("Le fichier est trop volumineux (max 10MB)");
        } else {
          setError("Format de fichier non supporté");
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const uploadedFile = acceptedFiles[0];
        setFile(uploadedFile);
        await processFile(uploadedFile);
      }
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    disabled: isProcessing,
  });

  const removeFile = () => {
    setFile(null);
    setError("");
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <div
          {...getRootProps()}
          className={cn(
            "cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 bg-grey-50",
            isDragActive
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border hover:border-primary/50 hover:bg-grey-100",
            isProcessing && "pointer-events-none opacity-50"
          )}
        >
          <input {...getInputProps()} />
          <Camera className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-lg font-medium text-primary">
              Déposez votre fichier ici...
            </p>
          ) : (
            <>
              <p className="font-medium text-foreground">
                Déposez votre amende ici
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                ou cliquez pour parcourir
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                PDF, JPG, PNG • Max 10MB
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-xl border border-border bg-grey-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
              <File className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={removeFile}
            disabled={isProcessing}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}
