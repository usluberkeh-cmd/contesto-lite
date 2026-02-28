"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { Camera, File, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  onFileRemove?: () => void;
  enableMobileScanner?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
};
const MOBILE_USER_AGENT_REGEX =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
const CAMERA_SCAN_MIME_TYPES = ["image/jpeg", "image/png"];

function getDropzoneErrorMessage(rejectedFiles: FileRejection[]) {
  const hasTooManyFiles = rejectedFiles.some(({ errors }) =>
    errors.some(({ code }) => code === "too-many-files"),
  );
  if (hasTooManyFiles) {
    return "Un seul fichier est autorisé à la fois.";
  }

  const hasFileTooLarge = rejectedFiles.some(({ errors }) =>
    errors.some(({ code }) => code === "file-too-large"),
  );
  if (hasFileTooLarge) {
    return "Le fichier est trop volumineux (max 10MB).";
  }

  const hasInvalidFileType = rejectedFiles.some(({ errors }) =>
    errors.some(({ code }) => code === "file-invalid-type"),
  );
  if (hasInvalidFileType) {
    return "Format non supporté. Utilisez PDF, JPG ou PNG.";
  }

  return "Le fichier est invalide.";
}

export function FileUpload({
  onFileUpload,
  onFileRemove,
  enableMobileScanner = true,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [isMobileOrCoarsePointer, setIsMobileOrCoarsePointer] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(pointer: coarse)");

    // # Reason: Some mobile browsers do not expose reliable UA or pointer hints on every device.
    const updateMobileState = () => {
      const hasMobileUserAgent = MOBILE_USER_AGENT_REGEX.test(
        window.navigator.userAgent,
      );
      setIsMobileOrCoarsePointer(mediaQuery.matches || hasMobileUserAgent);
    };

    updateMobileState();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateMobileState);
      return () => mediaQuery.removeEventListener("change", updateMobileState);
    }

    mediaQuery.addListener(updateMobileState);
    return () => mediaQuery.removeListener(updateMobileState);
  }, []);

  const processUploadedFile = useCallback(
    (uploadedFile: File) => {
      setFile(uploadedFile);

      try {
        onFileUpload(uploadedFile);
        toast.success("Fichier téléchargé avec succès");
      } catch (err) {
        console.error("[v0] File processing error:", err);
        setError("Erreur lors du traitement du fichier");
        toast.error("Erreur lors du traitement du fichier");
      }
    },
    [onFileUpload],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setError("");

      const attemptedFilesCount = acceptedFiles.length + rejectedFiles.length;
      if (attemptedFilesCount > 1) {
        setError("Un seul fichier est autorisé à la fois.");
        return;
      }

      if (rejectedFiles.length > 0) {
        setError(getDropzoneErrorMessage(rejectedFiles));
        return;
      }

      if (acceptedFiles.length !== 1) {
        setError("Sélectionnez un seul fichier.");
        return;
      }

      processUploadedFile(acceptedFiles[0]);
    },
    [processUploadedFile],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    maxFiles: 1,
  });

  const handleCameraCaptureClick = () => {
    setError("");
    cameraInputRef.current?.click();
  };

  const handleCameraCaptureChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError("");
    const selectedFiles = event.target.files;

    if (!selectedFiles || selectedFiles.length === 0) {
      return;
    }

    if (selectedFiles.length > 1) {
      setError("Un seul fichier est autorisé à la fois.");
      event.target.value = "";
      return;
    }

    const selectedFile = selectedFiles[0];
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("Le fichier est trop volumineux (max 10MB).");
      event.target.value = "";
      return;
    }

    if (!CAMERA_SCAN_MIME_TYPES.includes(selectedFile.type)) {
      setError("Format image non supporté. Utilisez JPG ou PNG.");
      event.target.value = "";
      return;
    }

    processUploadedFile(selectedFile);
    event.target.value = "";
  };

  const removeFile = () => {
    setFile(null);
    setError("");
    onFileRemove?.();
  };

  const showMobileScanner = enableMobileScanner && isMobileOrCoarsePointer;

  return (
    <div className="space-y-4">
      {!file ? (
        <div className="space-y-3">
          <div
            {...getRootProps()}
            className={cn(
              "cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 bg-grey-50",
              isDragActive
                ? "border-primary bg-primary/5 scale-[1.02]"
                : "border-border hover:border-primary/50 hover:bg-grey-100"
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
                  PDF (1 page), JPG, PNG • Max 10MB
                </p>
              </>
            )}
          </div>

          {showMobileScanner ? (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={handleCameraCaptureClick}
              >
                <Camera className="mr-2 h-5 w-5" />
                Scanner avec la caméra
              </Button>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/jpeg,image/png"
                capture="environment"
                className="hidden"
                onChange={handleCameraCaptureChange}
              />
            </div>
          ) : null}
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
