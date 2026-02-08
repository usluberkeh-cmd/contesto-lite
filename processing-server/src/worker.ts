import dotenv from "dotenv"
import type { ConnectionOptions, Processor } from "bullmq"
import { Worker } from "bullmq"

import { getGeminiClient } from "./gemini/client"
import { extractDataFromPdf, type GeminiClientLike } from "./gemini/extract"
import { TrafficFineSchema } from "./gemini/schemas"
import { normalizeExtractedFineData } from "./fines/normalize"

import {
  type FineProcessingJobPayload,
  QUEUE_NAME,
  getRedisConnectionOptions
} from "./queue/queue"
import { createSupabaseClient } from "./supabase/client"
import {
  type SupabaseClientLike,
  getFineFileUrlById,
  markFineFailed,
  markFineProcessedWithExtraction,
  markFineProcessing
} from "./supabase/fines"

import {
  downloadStorageFile,
  type SupabaseStorageClientLike
} from "./supabase/storage"

type WorkerLogger = {
  info: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
}
// WorkerLogger is an object type.
// It must have two methods: info and error.
// Both methods:
// Accept any number of arguments (...args)
// Each argument can be of any type (unknown)
// Do not return anything (void)

type CreateWorkerOptions = {
  connectionOptions?: ConnectionOptions
  logger?: WorkerLogger
  queueName?: string
  processor?: Processor<FineProcessingJobPayload>
  supabaseClient?: SupabaseClientLike & SupabaseStorageClientLike
  extractDataFromPdf?: typeof extractDataFromPdf
  getFineFileUrlById?: typeof getFineFileUrlById
  downloadPdfBuffer?: typeof downloadStorageFile
  geminiClient?: GeminiClientLike
  geminiModel?: string
  promptText?: string
  bucketName?: string
}

const defaultLogger: WorkerLogger = {
  info: (...args) => console.log(...args),
  error: (...args) => console.error(...args)
}

const DEFAULT_EXTRACTION_PROMPT =
  "Extract the following details from this French traffic fine notice."

function getGeminiModelOrThrow() {
  const model = process.env.GEMINI_MODEL
  if (!model) {
    throw new Error("GEMINI_MODEL is required")
  }
  return model
}

function getFineDocumentsBucketOrThrow() {
  const bucket = process.env.SUPABASE_FINE_DOCUMENTS_BUCKET
  if (!bucket) {
    throw new Error("SUPABASE_FINE_DOCUMENTS_BUCKET is required")
  }
  return bucket
}


export function createWorker(options: CreateWorkerOptions = {}) {
  const logger = options.logger ?? defaultLogger
  // if options logger is defined, use it. If it is undefined or null, use defaultLogger
  const queueName = options.queueName ?? QUEUE_NAME
  // If a queue name is passed → use it
  // Otherwise → fall back to a constant default
  const connection = options.connectionOptions ?? getRedisConnectionOptions()
  const supabaseClient = options.supabaseClient ?? createSupabaseClient()
  const extractData = options.extractDataFromPdf ?? extractDataFromPdf
  const getFineFileUrl = options.getFineFileUrlById ?? getFineFileUrlById
  const downloadPdfBuffer = options.downloadPdfBuffer ?? downloadStorageFile
  const geminiClient = options.geminiClient ?? getGeminiClient()
  const geminiModel = options.geminiModel ?? getGeminiModelOrThrow()
  const promptText = options.promptText ?? DEFAULT_EXTRACTION_PROMPT
  const bucketName = options.bucketName ?? getFineDocumentsBucketOrThrow()

  const processor: Processor<FineProcessingJobPayload> =
    options.processor ?? (async (job) => {
      try {
        const { fineId, fileName, webhook: webhookAudit } = job.data

        logger.info("Processing job:", job.id, job.data)
        // # Reason: Trace the webhook payload captured for audit/debugging.
        logger.info("Webhook audit payload attached:", {
          fineId,
          fileName,
          webhookAudit
        })

        const processingResult = await markFineProcessing(
          supabaseClient,
          fineId,
          fileName, 
          webhookAudit
        )
        logger.info("Fine status updated:", {
          step: "processing",
          fineId,
          fileName,
          ...processingResult
          // It copies all enumerable properties from processingResult
          // ... is object spread syntax.
        })

        if (processingResult.updatedCount === 0) {
          // # Reason: Avoid silent success when no row matches the identifiers.
          throw new Error("No fine matched for processing update")
        }
        
        // # Reason: file_url is the stable storage path required to download the PDF.
        const fileUrl = await getFineFileUrl(supabaseClient, fineId)
        logger.info("Fine storage path resolved:", { fineId, fileUrl, bucketName })

        if (!fileUrl) {
          throw new Error("Missing file_url for fine")
        }

        const pdfBuffer = await downloadPdfBuffer(
          supabaseClient,
          bucketName,
          fileUrl
        )
        logger.info("Fine PDF downloaded:", {
          fineId,
          fileUrl,
          pdfBytes: pdfBuffer.byteLength
        })

        const extractedData = await extractData(pdfBuffer, geminiClient, {
          model: geminiModel,
          prompt: promptText,
          responseSchema: TrafficFineSchema
        })
        logger.info("Gemini extraction completed:", {
          fineId,
          topLevelKeys: Object.keys(extractedData as Record<string, unknown>)
        })

        const normalization = normalizeExtractedFineData(extractedData)
        logger.info("Gemini extraction normalized:", {
          fineId,
          fineNumber: normalization.updates.fine_number,
          fineAmount: normalization.updates.fine_amount,
          fineDate: normalization.updates.fine_date,
          location: normalization.updates.location,
          violationType: normalization.updates.violation_type
        })

        if (normalization.validationErrors.length > 0) {
          logger.error("Gemini extraction validation failed:", {
            fineId,
            errors: normalization.validationErrors
          })
          throw new Error(
            `Invalid extracted data: ${normalization.validationErrors.join("; ")}`
          )
        }
         
        const result = { status: "success" }
        const processedResult = await markFineProcessedWithExtraction(
          supabaseClient,
          fineId,
          fileName,
          normalization.updates
        )
        logger.info("Fine status updated:", {
          step: "processed",
          fineId,
          fileName,
          ...processedResult
        })

        if (processedResult.updatedCount === 0) {
          // # Reason: Detect deletes/identifier mismatches between steps.
          throw new Error("No fine matched for processed update")
        }

        return result
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error"
        try {
          const { fineId, fileName, webhook: webhookAudit } = job.data
          const failedResult = await markFineFailed(
            supabaseClient,
            fineId,
            message,
            fileName,
            webhookAudit
          )
          logger.info("Fine status updated:", {
            step: "error",
            fineId,
            fileName,
            ...failedResult
          })
        } catch (markError) {
          logger.error("Failed to mark job as errored:", job.id, markError)
        }

        throw error
      }
    })

  const worker = new Worker<FineProcessingJobPayload>(queueName, processor, {
    connection
  })

  worker.on("completed", (job, result) => {
    logger.info("Job completed:", job.id, result)
  })

  worker.on("ready", () => {
    logger.info("Worker connected to Redis")
  })

  worker.on("failed", (job, error) => {
    logger.error("Job failed:", job?.id, error)
  })

  const close = async () => {
    await worker.close()
  }

  return { worker, close }
}

export function startWorker() {
  const { worker } = createWorker()
  return worker
}

if (require.main === module) {
  dotenv.config()
  startWorker()
}
