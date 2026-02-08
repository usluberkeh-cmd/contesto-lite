import assert from "node:assert/strict"
import test from "node:test"
import { z } from "zod/v3"

import {
  extractDataFromPdf,
  type GeminiClientLike
} from "../../src/gemini/extract"

test("extractDataFromPdf uses inline content for small PDFs", async () => {
  const requests: Array<{ contents: unknown[] }> = []
  let uploadCalls = 0

  const geminiClient: GeminiClientLike = {
    models: {
      generateContent: async (request) => {
        requests.push(request)
        return { text: JSON.stringify({ foo: "bar" }) }
      }
    },
    files: {
      upload: async () => {
        uploadCalls += 1
        return { uri: "file://mock" }
      }
    }
  }

  const schema = z.object({ foo: z.string() })
  const result = await extractDataFromPdf(
    Buffer.from("pdf"),
    geminiClient,
    { model: "test-model", prompt: "Prompt", responseSchema: schema }
  )

  assert.deepEqual(result, { foo: "bar" })
  assert.equal(uploadCalls, 0)
  assert.ok(
    "inlineData" in (requests[0].contents[0] as Record<string, unknown>)
  )
})

test("extractDataFromPdf uses File API for large PDFs", async () => {
  const requests: Array<{ contents: unknown[] }> = []
  let uploadCalls = 0

  const geminiClient: GeminiClientLike = {
    models: {
      generateContent: async (request) => {
        requests.push(request)
        return { text: JSON.stringify({ foo: "bar" }) }
      }
    },
    files: {
      upload: async () => {
        uploadCalls += 1
        return { uri: "file://mock" }
      }
    }
  }

  const schema = z.object({ foo: z.string() })
  const largeBuffer = Buffer.alloc(16 * 1024 * 1024)
  await extractDataFromPdf(largeBuffer, geminiClient, {
    model: "test-model",
    prompt: "Prompt",
    responseSchema: schema
  })

  assert.equal(uploadCalls, 1)
  assert.ok(
    "fileData" in (requests[0].contents[0] as Record<string, unknown>)
  )
})

test("extractDataFromPdf throws on invalid JSON", async () => {
  const geminiClient: GeminiClientLike = {
    models: {
      generateContent: async () => ({ text: "{bad json" })
    },
    files: {
      upload: async () => ({ uri: "file://mock" })
    }
  }

  const schema = z.object({ foo: z.string() })
  await assert.rejects(
    () =>
      extractDataFromPdf(Buffer.from("pdf"), geminiClient, {
        model: "test-model",
        prompt: "Prompt",
        responseSchema: schema
      }),
    /Gemini returned invalid JSON/
  )
})
