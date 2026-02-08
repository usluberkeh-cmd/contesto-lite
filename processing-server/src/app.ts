import cors from "cors"
import express from "express"
import type { Request } from "express"

import type { EnqueueFineProcessingJob } from "./queue/queue"
import { createWebhookRouter } from "./routes/webhook"

type CreateAppOptions = {
  enqueueFineProcessingJob: EnqueueFineProcessingJob
}

export function createApp({ enqueueFineProcessingJob }: CreateAppOptions) {
  const app = express()

  app.use(cors())
  //Enables Cross-Origin Resource Sharing.
  //Allows your API to be called from browsers hosted on other domains.
  // It’s okay if a browser from another website talks to me
  
  app.use(
    express.json({
      limit: "10mb",
      verify: (req, _res, buf) => {
        // req
        // This is the request object
        // It represents the incoming HTTP request
        // We can attach our own data to it

        // _res: The underscore _ means:
        // “I know this exists, but I’m not using it”
        // (This is just a convention, not special syntax.)

        //buf
        // This is the raw request body
        // Type: Buffer
        // It is the exact bytes that were sent over the network

        // # Reason: Webhook signature verification needs the raw payload.
        // ?: means that 
        // “rawBody might exist, and if it does, it will be a Buffer.”
        // It might also not exist at all.

        ;(req as Request & {rawBody?:Buffer}).rawBody=buf
        //➡️ “req is a normal Request plus an optional rawBody property that holds a Buffer.”
        // Adds a new property to the request object
        // Stores the raw request data there

        // A package arrives at your door.
        // Before opening it, you take a photo of the box.
        // Later, you open it and use what’s inside.

        // buf = the unopened package

        // req.body = the opened package

        // req.rawBody = the photo you saved        
      }
    })
  )

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" })
  })

  app.use("/webhook", createWebhookRouter(enqueueFineProcessingJob))

  return app
}
