import type { ConnectionOptions } from "bullmq"
import { Queue } from "bullmq"

export const QUEUE_NAME = "fine-processing"
export const JOB_NAME = "process-fine"

export type FineProcessingJobPayload = {
  fineId: string
  fileName?: string
  webhook: Record<string, unknown>
}

export type EnqueueFineProcessingJob = (
  payload: FineProcessingJobPayload
) => Promise<{ id: string | number | undefined }>

export function getRedisUrlOrThrow() {
  const redisUrl = process.env.REDIS_URL
  if (!redisUrl) {
    throw new Error("REDIS_URL is required to connect to Redis")
  }

  return redisUrl
}

export function getRedisConnectionOptions(): ConnectionOptions {
  return { url: getRedisUrlOrThrow() }
}

export function createQueue(queueName: string = QUEUE_NAME) {
  const queue = new Queue(queueName, { connection: getRedisConnectionOptions() })

  return { queue }
}

export function createEnqueueFineProcessingJob(queue: Queue) {
  return async (payload: FineProcessingJobPayload) => {
    const job = await queue.add(JOB_NAME, payload)
    return { id: job.id }
  }
}

export function __testOnlyGetRedisUrl() {
  return getRedisUrlOrThrow()
}
