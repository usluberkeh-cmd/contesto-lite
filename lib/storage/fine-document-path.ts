export interface FineDocumentPathInput {
  firstName: string
  lastName: string
  originalFileName: string
}

const DEFAULT_FOLDER_SLUG = "utilisateur"
const DEFAULT_FILE_BASE = "document"
const DEFAULT_FILE_EXTENSION = "bin"

function removeDiacritics(value: string): string {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
}

function sanitizeSlugPart(value: string): string {
  return removeDiacritics(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function splitOriginalFileName(originalFileName: string): {
  base: string
  extension: string
} {
  const trimmedName = originalFileName.trim()
  if (!trimmedName) {
    return {
      base: DEFAULT_FILE_BASE,
      extension: DEFAULT_FILE_EXTENSION
    }
  }

  const lastDotIndex = trimmedName.lastIndexOf(".")
  if (lastDotIndex <= 0 || lastDotIndex >= trimmedName.length - 1) {
    return {
      base: trimmedName,
      extension: DEFAULT_FILE_EXTENSION
    }
  }

  return {
    base: trimmedName.slice(0, lastDotIndex),
    extension: trimmedName.slice(lastDotIndex + 1)
  }
}

function createShortToken(): string {
  const token = Math.random().toString(36).slice(2, 8)
  return token.length >= 6 ? token : token.padEnd(6, "0")
}

export function buildFineDocumentPath({
  firstName,
  lastName,
  originalFileName
}: FineDocumentPathInput): string {
  // # Reason: Stable slugging keeps object keys ASCII-safe and avoids fragile characters in storage paths.
  const folderSlug = sanitizeSlugPart(`${firstName}-${lastName}`) || DEFAULT_FOLDER_SLUG
  const { base, extension } = splitOriginalFileName(originalFileName)
  const safeBaseName = sanitizeSlugPart(base) || DEFAULT_FILE_BASE
  const safeExtension =
    removeDiacritics(extension).toLowerCase().replace(/[^a-z0-9]+/g, "") ||
    DEFAULT_FILE_EXTENSION

  const timestamp = Date.now()
  const randomToken = createShortToken()

  return `${folderSlug}/${timestamp}-${randomToken}-${safeBaseName}.${safeExtension}`
}
