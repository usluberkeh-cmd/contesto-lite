import type { PostgrestSingleResponse } from "@supabase/supabase-js"

export type SupabaseUpdateResponse = PostgrestSingleResponse<{ id: string }[]>
//“When we run an update, Supabase will return a response that includes an array of rows, and each row has an id.”
export type SupabaseSelectResponse<T> = PostgrestSingleResponse<T>

type SupabaseUpdateBuilder = {
  eq: (column: string, value: string) => SupabaseUpdateBuilder
  //it returns SupabaseUpdateBuilder again 👀
  //builder.eq("id", "123")
  // Meaning:
  // “Only update rows where id equals "123"”
  // And because it returns SupabaseUpdateBuilder, you can keep chaining:
  select: (
    columns?: string,
    options?: { count?: "exact" | "planned" | "estimated" }
  ) => PromiseLike<SupabaseUpdateResponse>
  // Because Supabase talks to a remote database, which takes time.
  // So you must await it with PromiseLike
}

type SupabaseSelectBuilder<T> = {
  eq: (column: string, value: string) => SupabaseSelectBuilder<T>
  single: () => PromiseLike<SupabaseSelectResponse<T>>
}

export type SupabaseClientLike = {
  from: (table: string) => {
    //Returns an object with an update method
    update: (values: Record<string, unknown>) => SupabaseUpdateBuilder
    // Record<string, unknown> -> an object with string keys, and values can be any type
    // returns SupabaseUpdateBuilder, that way we can perform on operations defined on SupabaseUpdateBuilder
    select: <T extends Record<string, unknown>>(
      columns: string
    ) => SupabaseSelectBuilder<T>
     // select<T>(columns: string) returns a builder where T describes the shape of the rows you expect back.
     // returns SupabaseUpdateBuilder, that way we can perform on operations defined on SupabaseUpdateBuilder
  }
}

export type FineUpdateResult = {
  updatedCount: number
  matchedBy: "id" | "file_name" | null
}

function getUpdatedCount(response: SupabaseUpdateResponse) {
  return response.count ?? response.data?.length ?? 0
  // Use response.count if it exists
  // Otherwise, use response.data.length if data exists
  // Otherwise, return 0
}

async function updateFineByColumn(
  supabase: SupabaseClientLike,
  column: "id" | "file_name",
  value: string,
  updates: Record<string, unknown>
) {
  // This is where we update the supabase table
  const response = await supabase
    .from("fines")
    .update(updates)
    .eq(column, value)
    .select("id", { count: "exact" })

  if (response.error) {
    throw new Error(`Supabase update failed: ${response.error.message}`)
  }

  return getUpdatedCount(response)
}

async function updateFineWithFallback(
  supabase: SupabaseClientLike,
  fineId: string,
  fileName: string | undefined,
  updates: Record<string, unknown>
): Promise<FineUpdateResult> {
  // First update attempt by id
  const updatedById = await updateFineByColumn(supabase, "id", fineId, updates)
  if (updatedById > 0) {
    return { updatedCount: updatedById, matchedBy: "id" }
  }

  // # Reason: Allow filename-based updates when a UUID lookup misses.
  // If no rows updated and fileName exists, fall back to file_name 
  if (fileName) {
    const updatedByName = await updateFineByColumn(
      supabase,
      "file_name",
      fileName,
      updates
    )
    // Throw when the fallback update affects more than one row.
    if (updatedByName > 1) {
      console.error("Ambiguous file_name update:", {
        fileName,
        updatedCount: updatedByName,
        updates
      })
      throw new Error("file_name matched multiple rows")
    }
    if (updatedByName > 0) {
      return { updatedCount: updatedByName, matchedBy: "file_name" }
    }
  }

  return { updatedCount: 0, matchedBy: null }
}

type FineFileUrlRow = { file_url: string | null }

export async function getFineFileUrlById(
  supabase: SupabaseClientLike,
  fineId: string
): Promise<string | null> {
  // # Reason: file_url stores the stable storage path needed to download the PDF.
  const response = await supabase
    .from("fines")
    .select<FineFileUrlRow>("file_url")
    .eq("id", fineId)
    .single()

  if (response.error) {
    throw new Error(`Supabase select failed: ${response.error.message}`)
  }

  return response.data?.file_url ?? null
}

export async function markFineProcessing(
  supabase: SupabaseClientLike,
  fineId: string,
  fileName?: string,
  webhookAudit?: Record<string, unknown>
): Promise<FineUpdateResult> {
  const updates: Record<string, unknown> = {
    status: "processing"
  }
  // # Reason: Store webhook payload for audit/debugging when processing starts.
  if (webhookAudit !== undefined) {
    updates.webhook_audit = webhookAudit
  }
  return updateFineWithFallback(supabase, fineId, fileName, updates)
}

export async function markFineProcessed(
  supabase: SupabaseClientLike,
  fineId: string,
  fileName?: string
): Promise<FineUpdateResult> {
  // # Reason: We store when OCR finished to support SLA/reporting later.
  return updateFineWithFallback(supabase, fineId, fileName, {
    status: "processed",
    processed_at: new Date().toISOString()
  })
}

export async function markFineProcessedWithExtraction(
  supabase: SupabaseClientLike,
  fineId: string,
  fileName: string | undefined,
  extractedUpdates: Record<string, unknown>
): Promise<FineUpdateResult> {
  // # Reason: Ensure processed status is always applied alongside extracted fields.
  return updateFineWithFallback(supabase, fineId, fileName, {
    ...extractedUpdates,
    status: "processed",
    processed_at: new Date().toISOString()
  })
}

export async function markFineFailed(
  supabase: SupabaseClientLike,
  fineId: string,
  errorMessage: string,
  fileName?: string,
  webhookAudit?: Record<string, unknown>
): Promise<FineUpdateResult> {
  const updates: Record<string, unknown> = {
    status: "error",
    processing_error: errorMessage
  }
  // # Reason: Preserve webhook payload even when processing fails.
  if (webhookAudit !== undefined) {
    updates.webhook_audit = webhookAudit
  }
  return updateFineWithFallback(supabase, fineId, fileName, updates)
}
