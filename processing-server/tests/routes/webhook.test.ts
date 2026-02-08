import assert from "node:assert/strict"
import crypto from "node:crypto"
import { randomUUID } from "node:crypto"
import { once } from "node:events"
import test from "node:test"
import type { AddressInfo } from "node:net"

import { createApp } from "../../src/app"
import {
  createEnqueueFineProcessingJob,
  createQueue
} from "../../src/queue/queue"

function signPayload(payload: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex")
}

test("POST /webhook enqueues a fine processing job", async (t) => {
  assert.ok(process.env.REDIS_URL, "REDIS_URL must be set for webhook tests")

  const originalSecret = process.env.WEBHOOK_SECRET
  const secret = "test-secret"
  process.env.WEBHOOK_SECRET = secret
  t.after(() => {
    if (originalSecret) {
      process.env.WEBHOOK_SECRET = originalSecret
    } else {
      delete process.env.WEBHOOK_SECRET
    }
  })

  const queueName = `fine-processing-test-${randomUUID()}`
  const { queue } = createQueue(queueName)
  t.after(async () => {
    await queue.obliterate({ force: true })
    await queue.close()
  })

  const enqueueFineProcessingJob = createEnqueueFineProcessingJob(queue)
  const app = createApp({ enqueueFineProcessingJob })
  const server = app.listen(0)
  t.after(() => server.close())

  await once(server, "listening")
  const { port } = server.address() as AddressInfo

  const fineId = randomUUID()
  const payload = JSON.stringify({
    fineId,
    fileName: "fine-abc.pdf"
  })
  const response = await fetch(`http://127.0.0.1:${port}/webhook`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-webhook-signature": signPayload(payload, secret)
    },
    body: payload
  })

  const body = await response.json()
  assert.equal(response.status, 202)
  assert.equal(body.status, "queued")

  const job = await queue.getJob(body.jobId)
  assert.ok(job)
  assert.equal(job.data.fineId, fineId)
  assert.equal(job.data.fileName, "fine-abc.pdf")
})

test("POST /webhook accepts payload without fileName", async (t) => {
  assert.ok(process.env.REDIS_URL, "REDIS_URL must be set for webhook tests")

  const originalSecret = process.env.WEBHOOK_SECRET
  const secret = "test-secret"
  process.env.WEBHOOK_SECRET = secret
  t.after(() => {
    if (originalSecret) {
      process.env.WEBHOOK_SECRET = originalSecret
    } else {
      delete process.env.WEBHOOK_SECRET
    }
  })

  const queueName = `fine-processing-test-${randomUUID()}`
  const { queue } = createQueue(queueName)
  t.after(async () => {
    await queue.obliterate({ force: true })
    await queue.close()
  })

  const enqueueFineProcessingJob = createEnqueueFineProcessingJob(queue)
  const app = createApp({ enqueueFineProcessingJob })
  const server = app.listen(0)
  t.after(() => server.close())

  await once(server, "listening")
  const { port } = server.address() as AddressInfo

  const fineId = randomUUID()
  const payload = JSON.stringify({ fineId, note: "edge" })
  const response = await fetch(`http://127.0.0.1:${port}/webhook`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-webhook-signature": `sha256=${signPayload(payload, secret)}`
    },
    body: payload
  })

  const body = await response.json()
  assert.equal(response.status, 202)

  const job = await queue.getJob(body.jobId)
  assert.ok(job)
  assert.equal(job.data.fineId, fineId)
  assert.equal(job.data.fileName, undefined)
  assert.equal(job.data.webhook.note, "edge")
})

test("POST /webhook returns 400 when fineId is not a UUID", async (t) => {
  assert.ok(process.env.REDIS_URL, "REDIS_URL must be set for webhook tests")

  const originalSecret = process.env.WEBHOOK_SECRET
  const secret = "test-secret"
  process.env.WEBHOOK_SECRET = secret
  t.after(() => {
    if (originalSecret) {
      process.env.WEBHOOK_SECRET = originalSecret
    } else {
      delete process.env.WEBHOOK_SECRET
    }
  })

  const queueName = `fine-processing-test-${randomUUID()}`
  const { queue } = createQueue(queueName)
  t.after(async () => {
    await queue.obliterate({ force: true })
    await queue.close()
  })

  const enqueueFineProcessingJob = createEnqueueFineProcessingJob(queue)
  const app = createApp({ enqueueFineProcessingJob })
  const server = app.listen(0)
  t.after(() => server.close())

  await once(server, "listening")
  const { port } = server.address() as AddressInfo

  const payload = JSON.stringify({ fineId: "fine-abc" })
  const response = await fetch(`http://127.0.0.1:${port}/webhook`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-webhook-signature": signPayload(payload, secret)
    },
    body: payload
  })

  const body = await response.json()
  assert.equal(response.status, 400)
  assert.equal(body.error, "fineId must be a UUID string")
})

test("POST /webhook returns 400 when fineId is missing", async (t) => {
  assert.ok(process.env.REDIS_URL, "REDIS_URL must be set for webhook tests")

  const originalSecret = process.env.WEBHOOK_SECRET
  const secret = "test-secret"
  process.env.WEBHOOK_SECRET = secret
  t.after(() => {
    if (originalSecret) {
      process.env.WEBHOOK_SECRET = originalSecret
    } else {
      delete process.env.WEBHOOK_SECRET
    }
  })

  const queueName = `fine-processing-test-${randomUUID()}`
  const { queue } = createQueue(queueName)
  t.after(async () => {
    await queue.obliterate({ force: true })
    await queue.close()
  })

  const enqueueFineProcessingJob = createEnqueueFineProcessingJob(queue)
  const app = createApp({ enqueueFineProcessingJob })
  const server = app.listen(0)
  t.after(() => server.close())

  await once(server, "listening")
  const { port } = server.address() as AddressInfo

  const payload = JSON.stringify({})
  const response = await fetch(`http://127.0.0.1:${port}/webhook`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-webhook-signature": signPayload(payload, secret)
    },
    body: payload
  })

  const body = await response.json()
  assert.equal(response.status, 400)
  assert.equal(body.error, "fineId is required")
})

test("POST /webhook returns 401 when signature is missing", async (t) => {
  assert.ok(process.env.REDIS_URL, "REDIS_URL must be set for webhook tests")

  const originalSecret = process.env.WEBHOOK_SECRET
  const secret = "test-secret"
  process.env.WEBHOOK_SECRET = secret
  t.after(() => {
    if (originalSecret) {
      process.env.WEBHOOK_SECRET = originalSecret
    } else {
      delete process.env.WEBHOOK_SECRET
    }
  })

  const queueName = `fine-processing-test-${randomUUID()}`
  const { queue } = createQueue(queueName)
  t.after(async () => {
    await queue.obliterate({ force: true })
    await queue.close()
  })

  const enqueueFineProcessingJob = createEnqueueFineProcessingJob(queue)
  const app = createApp({ enqueueFineProcessingJob })
  const server = app.listen(0)
  t.after(() => server.close())

  await once(server, "listening")
  const { port } = server.address() as AddressInfo

  const payload = JSON.stringify({ fineId: "fine-missing-signature" })
  const response = await fetch(`http://127.0.0.1:${port}/webhook`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: payload
  })

  const body = await response.json()
  assert.equal(response.status, 401)
  assert.equal(body.error, "Signature is required")
})
