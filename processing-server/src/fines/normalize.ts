type ExtractedFine = {
  fine_identifiers?: { fine_number?: string }
  penalty?: { base_amount_eur?: number }
  notice_dates?: { infraction_date?: string }
  location?: {
    street_name?: string
    city?: string
    department_code?: string
    country?: string
  }
  infraction?: { infraction_category?: string }
}

export type NormalizedFineUpdates = {
  ai_analysis: Record<string, unknown>
  fine_number: string | null
  fine_amount: number | null
  fine_date: string | null
  location: string | null
  violation_type: string | null
}

export type NormalizationResult = {
  updates: NormalizedFineUpdates
  validationErrors: string[]
}

function normalizeDateToIso(raw: string): string | null {
  const trimmed = raw.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed
  }

  const match = trimmed.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/)
  if (!match) {
    return null
  }

  const [, day, month, year] = match
  const iso = `${year}-${month}-${day}`
  // # Reason: Prevent invalid dates (e.g. 31/02/2024) from being normalized.
  const parsed = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }
  if (parsed.toISOString().slice(0, 10) !== iso) {
    return null
  }

  return iso
}

export function normalizeExtractedFineData(
  extracted: ExtractedFine
): NormalizationResult {
  const validationErrors: string[] = []

  // when you read nested fields like extracted.fine_identifiers.fine_number, do it in a way that won’t throw if any parent object is missing. 
  // In this snippet, a “safe access pattern” is using optional chaining (like extracted.fine_identifiers?.fine_number) 
  // plus a fallback value (like "") so the code won’t crash when a nested object is undefined.    
  const fineNumber =
    // TODO (CORE LOGIC): Derive the fine number from the extracted data and normalize/trim it.
    typeof extracted.fine_identifiers?.fine_number === "string"
    ? extracted.fine_identifiers?.fine_number.trim()
    : ""
  if (!fineNumber) {
    // TODO (CORE LOGIC): Record a validation error when the fine number is missing/invalid.
    validationErrors.push("fine_number is required")
  }

  const fineAmount = 
    // TODO (CORE LOGIC): Extract the base amount from the penalty section.
    typeof extracted.penalty?.base_amount_eur === "number"
    ? extracted.penalty.base_amount_eur
    : null 
    //null is a numeric fallback
  if (typeof fineAmount !== "number" || !Number.isFinite(fineAmount)) {
    // TODO (CORE LOGIC): Record a validation error when the amount is not a finite number.
    validationErrors.push("fine_amount must be a finite number")
  }

  const rawDate =
    // TODO (CORE LOGIC): Extract the infraction date string from the notice dates.
    typeof extracted.notice_dates?.infraction_date === "string"
    ? extracted.notice_dates.infraction_date
    : ""
  const fineDate = rawDate ? normalizeDateToIso(rawDate) : null
  if (!fineDate) {
    // TODO (CORE LOGIC): Record a validation error when the date is missing or not parseable.
    validationErrors.push("fine_date is required and must be parseable")
  }

  const locationParts = [
    // TODO (CORE LOGIC): Collect the location subfields in order.
    extracted.location?.street_name,
    extracted.location?.city,
    extracted.location?.department_code,
    extracted.location?.country
  ]
    .filter(
      (value): value is string =>
        // TODO (CORE LOGIC): Filter to keep only non-empty strings.
        typeof value === "string" && value.trim().length > 0
    )
    .map((value) => value.trim())
  const location = locationParts.length > 0 ? locationParts.join(", ") : null

  const violationType =
    // TODO (CORE LOGIC): Extract and normalize the infraction category, if present.
    typeof extracted.infraction?.infraction_category === "string" && 
    extracted.infraction.infraction_category.trim().length > 0
    ? extracted.infraction.infraction_category.trim()
    : null

  return {
    updates: {
      ai_analysis: extracted as Record<string, unknown>,
      fine_number: fineNumber || null,
      fine_amount: typeof fineAmount === "number" ? fineAmount : null,
      fine_date: fineDate,
      location,
      violation_type: violationType
    },
    validationErrors
  }
}
