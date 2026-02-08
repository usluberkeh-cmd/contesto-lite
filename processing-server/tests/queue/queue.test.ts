import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import test from "node:test"

import {
  __testOnlyGetRedisUrl,
  createEnqueueFineProcessingJob,
  createQueue
} from "../../src/queue/queue"

test("enqueue stores fine data in Redis", async (t) => {
  assert.ok(process.env.REDIS_URL, "REDIS_URL must be set for queue tests")

  const queueName = `fine-processing-test-${randomUUID()}`
  const { queue } = createQueue(queueName)
  t.after(async () => {
    await queue.obliterate({ force: true })
    await queue.close()
  })

  const enqueueFineProcessingJob = createEnqueueFineProcessingJob(queue)
  const result = await enqueueFineProcessingJob({
    fineId: "fine-123",
    fileName: "fine-123.pdf",
    webhook: { fineId: "fine-123" }
  })

  assert.ok(result.id)

  const job = await queue.getJob(result.id)
  assert.ok(job)
  assert.equal(job.data.fineId, "fine-123")
  assert.equal(job.data.fileName, "fine-123.pdf")
})

test("enqueue allows fineId of '0'", async (t) => {
  assert.ok(process.env.REDIS_URL, "REDIS_URL must be set for queue tests")

  const queueName = `fine-processing-test-${randomUUID()}`
  const { queue } = createQueue(queueName)
  t.after(async () => {
    await queue.obliterate({ force: true })
    await queue.close()
  })

  const enqueueFineProcessingJob = createEnqueueFineProcessingJob(queue)
  const result = await enqueueFineProcessingJob({
    fineId: "0",
    webhook: { fineId: "0", extra: "edge" }
  })

  const job = await queue.getJob(result.id)
  assert.ok(job)
  assert.equal(job.data.fineId, "0")
  assert.equal(job.data.webhook.extra, "edge")
})

test("getRedisUrl throws when REDIS_URL is missing", () => {
  const originalRedisUrl = process.env.REDIS_URL
  delete process.env.REDIS_URL

  try {
    assert.throws(() => __testOnlyGetRedisUrl(), /REDIS_URL is required/)
  } finally {
    if (originalRedisUrl) {
      process.env.REDIS_URL = originalRedisUrl
    }
  }
})
