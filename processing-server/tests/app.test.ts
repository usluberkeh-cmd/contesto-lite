import assert from "node:assert/strict"
import { once } from "node:events"
import test from "node:test"
import type { AddressInfo } from "node:net"

import type { EnqueueFineProcessingJob } from "../src/queue/queue"
import { createApp } from "../src/app"

const enqueueFineProcessingJob: EnqueueFineProcessingJob = async () => ({
  id: "test-job"
})

test("GET /health returns ok", async (t) => {
  const app = createApp({ enqueueFineProcessingJob })
  const server = app.listen(0)
  t.after(() => server.close())

  await once(server, "listening")
  const { port } = server.address() as AddressInfo

  const response = await fetch(`http://127.0.0.1:${port}/health`)
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.deepEqual(body, { status: "ok" })
})

test("GET /health with query params still returns ok", async (t) => {
  const app = createApp({ enqueueFineProcessingJob })
  const server = app.listen(0)
  t.after(() => server.close())

  await once(server, "listening")
  const { port } = server.address() as AddressInfo

  const response = await fetch(`http://127.0.0.1:${port}/health?check=1`)
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.deepEqual(body, { status: "ok" })
})

test("POST /health returns 404", async (t) => {
  const app = createApp({ enqueueFineProcessingJob })
  const server = app.listen(0)
  t.after(() => server.close())

  await once(server, "listening")
  const { port } = server.address() as AddressInfo

  const response = await fetch(`http://127.0.0.1:${port}/health`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ping: true })
  })

  assert.equal(response.status, 404)
})
