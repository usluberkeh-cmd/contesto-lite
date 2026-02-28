const PENDING_PROFILE_MERGE_KEY = "contesto-pending-profile-merge"
const MAX_PENDING_PROFILE_MERGE_AGE_MS = 24 * 60 * 60 * 1000

export type PendingProfileMergePayload = {
  targetEmail: string
  first_name: string | null
  last_name: string | null
  address: string | null
  phone: string | null
  createdAt: number
  sourceUserId?: string
}

const isBrowser = (): boolean => {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

const safeReadRawPayload = (): string | null => {
  if (!isBrowser()) {
    return null
  }

  try {
    return window.localStorage.getItem(PENDING_PROFILE_MERGE_KEY)
  } catch {
    return null
  }
}

const safeRemoveRawPayload = (): void => {
  if (!isBrowser()) {
    return
  }

  try {
    window.localStorage.removeItem(PENDING_PROFILE_MERGE_KEY)
  } catch {
    // Ignore write errors in private modes.
  }
}

const toNullableString = (value: unknown): string | null => {
  return typeof value === "string" ? value : null
}

const isPendingProfileMergePayload = (
  value: unknown
): value is PendingProfileMergePayload => {
  if (!value || typeof value !== "object") {
    return false
  }

  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.targetEmail === "string" &&
    typeof candidate.createdAt === "number" &&
    (candidate.first_name === null || typeof candidate.first_name === "string") &&
    (candidate.last_name === null || typeof candidate.last_name === "string") &&
    (candidate.address === null || typeof candidate.address === "string") &&
    (candidate.phone === null || typeof candidate.phone === "string") &&
    (candidate.sourceUserId === undefined || typeof candidate.sourceUserId === "string")
  )
}

export const isPendingProfileMergeExpired = (
  payload: PendingProfileMergePayload
): boolean => {
  return Date.now() - payload.createdAt > MAX_PENDING_PROFILE_MERGE_AGE_MS
}

export const savePendingProfileMerge = (
  payload: Omit<PendingProfileMergePayload, "createdAt">
): void => {
  if (!isBrowser()) {
    return
  }

  const sanitizedPayload: PendingProfileMergePayload = {
    targetEmail: payload.targetEmail.trim().toLowerCase(),
    first_name: toNullableString(payload.first_name)?.trim() || null,
    last_name: toNullableString(payload.last_name)?.trim() || null,
    address: toNullableString(payload.address)?.trim() || null,
    phone: toNullableString(payload.phone)?.trim() || null,
    createdAt: Date.now(),
    sourceUserId: payload.sourceUserId,
  }

  try {
    window.localStorage.setItem(
      PENDING_PROFILE_MERGE_KEY,
      JSON.stringify(sanitizedPayload)
    )
  } catch {
    // Ignore write errors in private modes.
  }
}

export const clearPendingProfileMerge = (): void => {
  safeRemoveRawPayload()
}

export const getPendingProfileMerge = (): PendingProfileMergePayload | null => {
  const rawPayload = safeReadRawPayload()
  if (!rawPayload) {
    return null
  }

  try {
    const parsedPayload: unknown = JSON.parse(rawPayload)
    if (!isPendingProfileMergePayload(parsedPayload)) {
      safeRemoveRawPayload()
      return null
    }

    if (isPendingProfileMergeExpired(parsedPayload)) {
      safeRemoveRawPayload()
      return null
    }

    return parsedPayload
  } catch {
    safeRemoveRawPayload()
    return null
  }
}
