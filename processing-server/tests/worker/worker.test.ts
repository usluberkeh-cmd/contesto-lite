import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { once } from "node:events"
import test from "node:test"

import type { FineProcessingJobPayload } from "../../src/queue/queue"
import { JOB_NAME, createQueue } from "../../src/queue/queue"
import { createWorker } from "../../src/worker"
import type { SupabaseClientLike } from "../../src/supabase/fines"
import type { SupabaseStorageClientLike } from "../../src/supabase/storage"
import type { GeminiClientLike } from "../../src/gemini/extract"

type SupabaseCall = {
  table: string
  data: Record<string, unknown>
  column: string
  value: string
}

type MockUpdateResult = {
  errorMessage?: string | null
  updatedCount?: number
}

function createMockSupabase(updateSequence: MockUpdateResult[] = []) {
  const calls: SupabaseCall[] = []
  let callIndex = 0

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

  const client: SupabaseClientLike & SupabaseStorageClientLike = {
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
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: { file_url: "mock-path.pdf" },
            error: null
          })
        })
      })
    })
    ,
    storage: {
      from: () => ({
        download: async () => ({
          data: new Blob(["pdf-bytes"]),
          error: null
        })
      })
    }
  }

  return { client, calls }
}

const DEFAULT_PROMPT_TEXT =
  "Extract the following details from this French traffic fine notice."
const DEFAULT_MODEL = "test-model"
const DEFAULT_BUCKET = "fine-documents"

type DownloadCall = {
  bucket: string
  path: string
}

type ExtractCall = {
  pdfBuffer: Buffer
  options: { model: string; prompt?: string }
}

function createWorkerDependencies() {
  const extractCalls: ExtractCall[] = []
  const fileUrlCalls: string[] = []
  const downloadCalls: DownloadCall[] = []

  const getFineFileUrlById = async (
    _client: SupabaseClientLike,
    fineId: string
  ) => {
    fileUrlCalls.push(fineId)
    return "user-1/fine-1.pdf"
  }

  const downloadPdfBuffer = async (
    _client: SupabaseClientLike & SupabaseStorageClientLike,
    bucket: string,
    path: string
  ) => {
    downloadCalls.push({ bucket, path })
    return Buffer.from("pdf-bytes")
  }

  const extractDataFromPdf = async (
    pdfBuffer: Buffer,
    _client: GeminiClientLike,
    options: { model: string; prompt?: string; responseSchema?: unknown }
  ) => {
    extractCalls.push({ pdfBuffer, options })
    return { document_type: "avis_de_contravention" } as unknown
  }

  const geminiClient: GeminiClientLike = {
    models: {
      generateContent: async () => ({ text: "{}" })
    },
    files: {
      upload: async () => ({ uri: "file://mock" })
    }
  }

  return {
    extractCalls,
    fileUrlCalls,
    downloadCalls,
    workerOptions: {
      extractDataFromPdf,
      getFineFileUrlById,
      downloadPdfBuffer,
      geminiClient
    }
  }
}

test("worker processes jobs and logs payload", async (t) => {
  assert.ok(process.env.REDIS_URL, "REDIS_URL must be set for worker tests")

  const queueName = `fine-processing-test-${randomUUID()}`
  const { queue } = createQueue(queueName)
  const infoLogs: unknown[][] = []
  const errorLogs: unknown[][] = []
  const { client: supabaseClient, calls } = createMockSupabase()
  const { extractCalls, fileUrlCalls, downloadCalls, workerOptions } =
    createWorkerDependencies()

  const { worker, close } = createWorker({
    queueName,
    logger: {
      info: (...args) => infoLogs.push(args),
      error: (...args) => errorLogs.push(args)
    },
    supabaseClient,
    ...workerOptions,
    geminiModel: DEFAULT_MODEL,
    promptText: DEFAULT_PROMPT_TEXT,
    bucketName: DEFAULT_BUCKET
  })

  t.after(async () => {
    await queue.obliterate({ force: true })
    await queue.close()
    await close()
  })

  const payload: FineProcessingJobPayload = {
    fineId: "fine-001",
    fileName: "fine-001.pdf",
    webhook: { fineId: "fine-001" }
  }

  const job = await queue.add(JOB_NAME, payload)
  const [completedJob, result] = await once(worker, "completed")

  assert.equal(completedJob.id, job.id)
  assert.deepEqual(result, { status: "success" })
  assert.equal(errorLogs.length, 0)

  const processingLog = infoLogs.find((entry) => entry[0] === "Processing job:")
  assert.ok(processingLog)
  assert.equal(processingLog[1], job.id)
  assert.deepEqual(processingLog[2], payload)

  assert.equal(calls.length, 2)
  assert.equal(calls[0].table, "fines")
  assert.deepEqual(calls[0].data, {
    status: "processing",
    webhook_audit: payload.webhook
  })
  assert.equal(calls[0].column, "id")
  assert.equal(calls[0].value, payload.fineId)
  assert.equal(calls[1].table, "fines")
  assert.equal(calls[1].data.status, "processed")
  assert.ok(calls[1].data.processed_at)

  assert.equal(fileUrlCalls[0], payload.fineId)
  assert.deepEqual(downloadCalls[0], {
    bucket: DEFAULT_BUCKET,
    path: "user-1/fine-1.pdf"
  })
  assert.equal(extractCalls.length, 1)
  assert.equal(extractCalls[0].options.model, DEFAULT_MODEL)
  assert.equal(extractCalls[0].options.prompt, DEFAULT_PROMPT_TEXT)
})

test("worker falls back to file_name when id update misses", async (t) => {
  assert.ok(process.env.REDIS_URL, "REDIS_URL must be set for worker tests")

  const queueName = `fine-processing-test-${randomUUID()}`
  const { queue } = createQueue(queueName)
  const { client: supabaseClient, calls } = createMockSupabase([
    { updatedCount: 0 },
    { updatedCount: 1 },
    { updatedCount: 0 },
    { updatedCount: 1 }
  ])
  const { workerOptions } = createWorkerDependencies()

  const { worker, close } = createWorker({
    queueName,
    logger: {
      info: () => undefined,
      error: () => undefined
    },
    supabaseClient,
    ...workerOptions,
    geminiModel: DEFAULT_MODEL,
    promptText: DEFAULT_PROMPT_TEXT,
    bucketName: DEFAULT_BUCKET
  })

  t.after(async () => {
    await queue.obliterate({ force: true })
    await queue.close()
    await close()
  })

  const payload: FineProcessingJobPayload = {
    fineId: "fine-002",
    fileName: "fine-002.pdf",
    webhook: { fineId: "fine-002" }
  }

  const job = await queue.add(JOB_NAME, payload)
  const [completedJob, result] = await once(worker, "completed")

  assert.equal(completedJob.id, job.id)
  assert.deepEqual(result, { status: "success" })
  assert.equal(calls.length, 4)
  assert.equal(calls[0].column, "id")
  assert.equal(calls[1].column, "file_name")
  assert.equal(calls[2].column, "id")
  assert.equal(calls[3].column, "file_name")
  assert.equal(calls[1].value, payload.fileName)
})

test("worker handles missing fileName", async (t) => {
  assert.ok(process.env.REDIS_URL, "REDIS_URL must be set for worker tests")

  const queueName = `fine-processing-test-${randomUUID()}`
  const { queue } = createQueue(queueName)
  const infoLogs: unknown[][] = []
  const { client: supabaseClient, calls } = createMockSupabase()
  const { workerOptions } = createWorkerDependencies()

  const { worker, close } = createWorker({
    queueName,
    logger: {
      info: (...args) => infoLogs.push(args),
      error: () => undefined
    },
    supabaseClient,
    ...workerOptions,
    geminiModel: DEFAULT_MODEL,
    promptText: DEFAULT_PROMPT_TEXT,
    bucketName: DEFAULT_BUCKET
  })

  t.after(async () => {
    await queue.obliterate({ force: true })
    await queue.close()
    await close()
  })

  const payload: FineProcessingJobPayload = {
    fineId: "0",
    webhook: { fineId: "0" }
  }

  await queue.add(JOB_NAME, payload)
  await once(worker, "completed")

  const processingLog = infoLogs.find((entry) => entry[0] === "Processing job:")
  assert.ok(processingLog)
  assert.deepEqual(processingLog[2], payload)
  assert.equal(calls[0]?.value, "0")
})

test("worker fails when file_url is missing", async (t) => {
  assert.ok(process.env.REDIS_URL, "REDIS_URL must be set for worker tests")

  const queueName = `fine-processing-test-${randomUUID()}`
  const { queue } = createQueue(queueName)
  const errorLogs: unknown[][] = []
  const { client: supabaseClient, calls } = createMockSupabase()
  const { workerOptions } = createWorkerDependencies()
  workerOptions.getFineFileUrlById = async () => null

  const { worker, close } = createWorker({
    queueName,
    logger: {
      info: () => undefined,
      error: (...args) => errorLogs.push(args)
    },
    supabaseClient,
    ...workerOptions,
    geminiModel: DEFAULT_MODEL,
    promptText: DEFAULT_PROMPT_TEXT,
    bucketName: DEFAULT_BUCKET
  })

  t.after(async () => {
    await queue.obliterate({ force: true })
    await queue.close()
    await close()
  })

  await queue.add(JOB_NAME, {
    fineId: "fine-no-file",
    webhook: { fineId: "fine-no-file" }
  })

  const [failedJob] = await once(worker, "failed")

  assert.ok(failedJob)
  assert.ok(errorLogs.length > 0)
  assert.equal(errorLogs[0][0], "Job failed:")
  assert.equal(calls.length, 2)
  assert.equal(calls[1].data.status, "error")
  assert.equal(calls[1].data.processing_error, "Missing file_url for fine")
})

test("worker fails when no fine matches the identifiers", async (t) => {
  assert.ok(process.env.REDIS_URL, "REDIS_URL must be set for worker tests")

  const queueName = `fine-processing-test-${randomUUID()}`
  const { queue } = createQueue(queueName)
  const errorLogs: unknown[][] = []
  const { client: supabaseClient } = createMockSupabase([
    { updatedCount: 0 },
    { updatedCount: 1 }
  ])
  const { workerOptions } = createWorkerDependencies()

  const { worker, close } = createWorker({
    queueName,
    logger: {
      info: () => undefined,
      error: (...args) => errorLogs.push(args)
    },
    supabaseClient,
    ...workerOptions,
    geminiModel: DEFAULT_MODEL,
    promptText: DEFAULT_PROMPT_TEXT,
    bucketName: DEFAULT_BUCKET
  })

  t.after(async () => {
    await queue.obliterate({ force: true })
    await queue.close()
    await close()
  })

  await queue.add(JOB_NAME, {
    fineId: "fine-missing",
    webhook: { fineId: "fine-missing" }
  })

  const [failedJob] = await once(worker, "failed")

  assert.ok(failedJob)
  assert.ok(errorLogs.length > 0)
  assert.equal(errorLogs[0][0], "Job failed:")
})

test("worker logs failures", async (t) => {
  assert.ok(process.env.REDIS_URL, "REDIS_URL must be set for worker tests")

  const queueName = `fine-processing-test-${randomUUID()}`
  const { queue } = createQueue(queueName)
  const errorLogs: unknown[][] = []
  const { client: supabaseClient, calls } = createMockSupabase([
    { errorMessage: "update failed" },
    { updatedCount: 1 }
  ])
  const { workerOptions } = createWorkerDependencies()

  const { worker, close } = createWorker({
    queueName,
    logger: {
      info: () => undefined,
      error: (...args) => errorLogs.push(args)
    },
    supabaseClient,
    ...workerOptions,
    geminiModel: DEFAULT_MODEL,
    promptText: DEFAULT_PROMPT_TEXT,
    bucketName: DEFAULT_BUCKET
  })

  t.after(async () => {
    await queue.obliterate({ force: true })
    await queue.close()
    await close()
  })

  await queue.add(JOB_NAME, {
    fineId: "fine-fail",
    webhook: { fineId: "fine-fail" }
  })

  const [failedJob] = await once(worker, "failed")

  assert.ok(failedJob)
  assert.ok(errorLogs.length > 0)
  assert.equal(errorLogs[0][0], "Job failed:")
  assert.equal(calls.length, 2)
  assert.deepEqual(calls[0].data, {
    status: "processing",
    webhook_audit: { fineId: "fine-fail" }
  })
  assert.deepEqual(calls[1].data, {
    status: "error",
    processing_error: "Supabase update failed: update failed",
    webhook_audit: { fineId: "fine-fail" }
  })
})

test("worker fails when file_name matches multiple rows", async (t) => {
  assert.ok(process.env.REDIS_URL, "REDIS_URL must be set for worker tests")

  const queueName = `fine-processing-test-${randomUUID()}`
  const { queue } = createQueue(queueName)
  const errorLogs: unknown[][] = []
  const { client: supabaseClient } = createMockSupabase([
    { updatedCount: 0 },
    { updatedCount: 2 }
  ])
  const { workerOptions } = createWorkerDependencies()

  const { worker, close } = createWorker({
    queueName,
    logger: {
      info: () => undefined,
      error: (...args) => errorLogs.push(args)
    },
    supabaseClient,
    ...workerOptions,
    geminiModel: DEFAULT_MODEL,
    promptText: DEFAULT_PROMPT_TEXT,
    bucketName: DEFAULT_BUCKET
  })

  t.after(async () => {
    await queue.obliterate({ force: true })
    await queue.close()
    await close()
  })

  await queue.add(JOB_NAME, {
    fineId: "fine-ambiguous",
    fileName: "fine-ambiguous.pdf",
    webhook: { fineId: "fine-ambiguous" }
  })

  const [failedJob] = await once(worker, "failed")

  assert.ok(failedJob)
  assert.ok(errorLogs.length > 0)
  assert.equal(errorLogs[0][0], "Job failed:")
})
