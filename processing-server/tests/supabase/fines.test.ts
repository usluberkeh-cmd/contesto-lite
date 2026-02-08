import assert from "node:assert/strict"
import test from "node:test"

import {
  getFineFileUrlById,
  markFineFailed,
  markFineProcessed,
  markFineProcessing,
  type SupabaseClientLike
} from "../../src/supabase/fines"

type SupabaseCall = {
  table: string
  data: Record<string, unknown>
  column: string
  value: string
}

type SupabaseSelectCall = {
  table: string
  columns: string
  column: string
  value: string
}

type MockUpdateResult = {
  errorMessage?: string | null
  updatedCount?: number
}

type MockSelectResult = {
  errorMessage?: string | null
  data?: { file_url: string | null } | null
}

function createMockSupabase(
  updateSequence: MockUpdateResult[] = [],
  selectSequence: MockSelectResult[] = []
) {
  const calls: SupabaseCall[] = []
  const selectCalls: SupabaseSelectCall[] = []
  let callIndex = 0
  let selectIndex = 0
  const nextResponse = () => {
    const entry = updateSequence[callIndex] ?? {}
    callIndex += 1
    const updatedCount =
      entry.updatedCount ?? (entry.errorMessage ? 0 : 1)
    return {
      error: entry.errorMessage ? { message: entry.errorMessage } : null,
      count: updatedCount,
      data: updatedCount > 0 ? [{ id: "mock-id" }] : [],
      status: entry.errorMessage ? 400 : 200,
      statusText: entry.errorMessage ? "Bad Request" : "OK"
    }
  }
  const nextSelectResponse = () => {
    const entry = selectSequence[selectIndex] ?? {}
    selectIndex += 1
    const data =
      entry.data ?? (entry.errorMessage ? null : { file_url: "mock-path.pdf" })
    return {
      error: entry.errorMessage ? { message: entry.errorMessage } : null,
      data
    }
  }
  const client: SupabaseClientLike = {
    from: (table) => ({
      update: (data) => ({
        eq: (column, value) => {
          calls.push({ table, data, column, value })
          return {
            eq: () => {
              throw new Error("eq should not be called twice in tests")
            },
            select: async () => nextResponse()
          }
        },
        select: async () => nextResponse()
      }),
      select: (columns) => ({
        eq: (column, value) => {
          selectCalls.push({ table, columns, column, value })
          return {
            eq: () => {
              throw new Error("eq should not be called twice in select tests")
            },
            single: async () => nextSelectResponse()
          }
        }
      })
    })
  }

  return { client, calls, selectCalls }
}

test("markFineProcessing updates status to processing", async () => {
  const { client, calls } = createMockSupabase()

  const result = await markFineProcessing(client, "fine-1")

  assert.equal(calls.length, 1)
  assert.equal(calls[0].table, "fines")
  assert.deepEqual(calls[0].data, { status: "processing" })
  assert.equal(calls[0].column, "id")
  assert.equal(calls[0].value, "fine-1")
  assert.deepEqual(result, { updatedCount: 1, matchedBy: "id" })
})

test("markFineProcessing stores webhook_audit when provided", async () => {
  const { client, calls } = createMockSupabase()
  const webhookAudit = { source: "webhook", nested: { id: "audit-1" } }

  await markFineProcessing(client, "fine-1", "fine-1.pdf", webhookAudit)

  assert.deepEqual(calls[0].data, {
    status: "processing",
    webhook_audit: webhookAudit
  })
})

test("markFineProcessed sets processed_at", async () => {
  const { client, calls } = createMockSupabase()

  const result = await markFineProcessed(client, "fine-2")

  assert.equal(calls.length, 1)
  assert.equal(calls[0].data.status, "processed")
  assert.ok(calls[0].data.processed_at)
  assert.deepEqual(result, { updatedCount: 1, matchedBy: "id" })
})

test("markFineProcessing falls back to file_name when id misses", async () => {
  const { client, calls } = createMockSupabase([
    { updatedCount: 0 },
    { updatedCount: 1 }
  ])

  const result = await markFineProcessing(client, "fine-4", "fine-4.pdf")

  assert.equal(calls.length, 2)
  assert.equal(calls[0].column, "id")
  assert.equal(calls[1].column, "file_name")
  assert.deepEqual(result, { updatedCount: 1, matchedBy: "file_name" })
})

test("markFineFailed throws on Supabase error", async () => {
  const { client } = createMockSupabase([{ errorMessage: "nope" }])

  await assert.rejects(
    () => markFineFailed(client, "fine-3", "boom"),
    /Supabase update failed: nope/
  )
})

test("markFineFailed stores webhook_audit when provided", async () => {
  const { client, calls } = createMockSupabase()
  const webhookAudit = { source: "webhook", reason: "debug" }

  await markFineFailed(client, "fine-3", "boom", "fine-3.pdf", webhookAudit)

  assert.deepEqual(calls[0].data, {
    status: "error",
    processing_error: "boom",
    webhook_audit: webhookAudit
  })
})

test("markFineProcessing throws when file_name matches multiple rows", async () => {
  const { client } = createMockSupabase([
    { updatedCount: 0 },
    { updatedCount: 2 }
  ])

  await assert.rejects(
    () => markFineProcessing(client, "fine-4", "fine-4.pdf"),
    /file_name matched multiple rows/
  )
})

test("getFineFileUrlById returns the file_url path", async () => {
  const { client, selectCalls } = createMockSupabase([], [
    { data: { file_url: "user-1/fine-1.pdf" } }
  ])

  const result = await getFineFileUrlById(client, "fine-1")

  assert.equal(result, "user-1/fine-1.pdf")
  assert.equal(selectCalls.length, 1)
  assert.equal(selectCalls[0].table, "fines")
  assert.equal(selectCalls[0].columns, "file_url")
  assert.equal(selectCalls[0].column, "id")
  assert.equal(selectCalls[0].value, "fine-1")
})

test("getFineFileUrlById returns null when file_url is empty", async () => {
  const { client } = createMockSupabase([], [{ data: { file_url: null } }])

  const result = await getFineFileUrlById(client, "fine-2")

  assert.equal(result, null)
})

test("getFineFileUrlById throws on Supabase select error", async () => {
  const { client } = createMockSupabase([], [{ errorMessage: "nope" }])

  await assert.rejects(
    () => getFineFileUrlById(client, "fine-3"),
    /Supabase select failed: nope/
  )
})
