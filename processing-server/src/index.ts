import dotenv from "dotenv"

import { createApp } from "./app"
import { createEnqueueFineProcessingJob, createQueue } from "./queue/queue"

dotenv.config()

const { queue } = createQueue()
const enqueueFineProcessingJob = createEnqueueFineProcessingJob(queue)

const app = createApp({ enqueueFineProcessingJob })

const portFromEnv = process.env.PORT
const parsedPort = portFromEnv ? Number(portFromEnv) : 3001
const port = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 3001

app.listen(port, () => {
  console.log(`Processing server listening on port ${port}`)
})
