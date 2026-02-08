import crypto from "node:crypto"
import type { Request, Response } from "express"
import { Router } from "express"

import type {
  EnqueueFineProcessingJob,
  FineProcessingJobPayload
} from "../queue/queue"

class WebhookPayloadError extends Error {
  statusCode = 400
}

class WebhookSignatureError extends Error {
  statusCode: number

  constructor(message: string, statusCode = 401) {
    super(message)
    this.statusCode = statusCode
  }
}

const SIGNATURE_HEADER = "x-webhook-signature"
const SIGNATURE_PREFIX = "sha256="
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type RequestWithRawBody = Request & { rawBody?: Buffer }

function getWebhookSecretOrThrow() {
  const secret = process.env.WEBHOOK_SECRET
  if (!secret) {
    throw new WebhookSignatureError(
      "WEBHOOK_SECRET is not configured",
      500
    )
  }

  return secret
}

function normalizeSignature(signature: string) {
  return signature.startsWith(SIGNATURE_PREFIX)
    ? signature.slice(SIGNATURE_PREFIX.length)
    : signature
}

function computeSignature(payload: Buffer, secret: string) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex")
  // hash-based message authentication code (HMAC)
  // Finalizes the HMAC calculation and outputs it in hexadecimal format.
  // This is the "signature" of the payload.  
}

function timingSafeEqualHex(a: string, b: string) {
  const aBuffer = Buffer.from(a, "hex")
  const bBuffer = Buffer.from(b, "hex")
  if (aBuffer.length !== bBuffer.length) {
    return false
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer)
  // prevents timing attacks
  // In normal string comparisons (===), an attacker could measure how long 
  // the comparison takes and gradually guess the secret (e.g., a password or token).
}

function isUuid(value: string) {
  return UUID_REGEX.test(value)
}

function verifyWebhookSignature(rawBody: Buffer | undefined, signature: string) {
  if (!rawBody) {
    throw new WebhookSignatureError(
      "Raw body is required for signature verification",
      400
    )
  }

  const secret = getWebhookSecretOrThrow()
  const normalizedSignature = normalizeSignature(signature)
  const expectedSignature = computeSignature(rawBody, secret)

  if (!timingSafeEqualHex(normalizedSignature, expectedSignature)) {
    throw new WebhookSignatureError("Invalid signature")
  }
}

function parseWebhookPayload(body: unknown): FineProcessingJobPayload {
  //  Returns FineProcessingJobPayload
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new WebhookPayloadError("Payload must be an object")
  }

  const fineId = (body as { fineId?: unknown }).fineId
  //try to read fineId from the payload, but don’t assume it exists or has a type yet.
  // Hey, treat this value as if it has this type.
  //Assume body is an object with an optional fineId property

  if (fineId === undefined || fineId === null) {
    throw new WebhookPayloadError("fineId is required")
  }

  if (typeof fineId !== "string") {
    throw new WebhookPayloadError("fineId must be a UUID string")
  }
  if (!isUuid(fineId)) {
    throw new WebhookPayloadError("fineId must be a UUID string")
  }

  const fileName = (body as { fileName?: unknown }).fileName
  const normalizedFileName = typeof fileName === "string" ? fileName : undefined

  // # Reason: Match the Supabase UUID primary key format early to avoid silent no-op updates.
  const normalizedFineId = fineId

  return {
    fineId: normalizedFineId,
    fileName: normalizedFileName,
    webhook: body as Record<string, unknown>
    //store the raw payload as an object with string keys, but don’t assume any value types.
  }
}

export function createWebhookRouter (
  enqueueFineProcessingJob: EnqueueFineProcessingJob
){
  const router = Router()

  // define a post route 
  router.post("/", async (req: Request, res: Response) => {
    try {
      // extract the signature 
      const signature = req.header(SIGNATURE_HEADER)
      if (!signature) {
        throw new WebhookSignatureError("Missing signature header", 400)
      }
      // verify the signature
      verifyWebhookSignature(
        (req as RequestWithRawBody).rawBody,
        signature
      )

      const payload = parseWebhookPayload(req.body)
      console.info("Webhook payload accepted:", {
        fineId: payload.fineId,
        fileName: payload.fileName
      })
      const job = await enqueueFineProcessingJob(payload)
      console.info("Webhook job enqueued:", {
        jobId: job.id,
        fineId: payload.fineId
      })

      res.status(202).json({ status: "queued", jobId: job.id })
    } catch (error) {
      if (error instanceof WebhookSignatureError) {
        res.status(error.statusCode).json({ error: error.message })
        return
      }

      if (error instanceof WebhookPayloadError) {
        res.status(error.statusCode).json({ error: error.message })
        return
      }

      res.status(500).json({ error: "Failed to enqueue job" })
    }
  })
  return router
}



export function __testOnlyParseWebhookPayload(body: unknown) {
  return parseWebhookPayload(body)
}
