import assert from "node:assert/strict"
import test from "node:test"

import {
  __testOnlyGetGeminiApiKey,
  __testOnlyResetGeminiClient,
  getGeminiClient
} from "../../src/gemini/client"

const originalApiKey = process.env.GEMINI_API_KEY

function resetEnv() {
  if (originalApiKey) {
    process.env.GEMINI_API_KEY = originalApiKey
  } else {
    delete process.env.GEMINI_API_KEY
  }

  __testOnlyResetGeminiClient()
}

test("getGeminiClient returns a client when GEMINI_API_KEY is set", (t) => {
  t.after(resetEnv)
  process.env.GEMINI_API_KEY = "test-key"

  const client = getGeminiClient()

  assert.equal(typeof client.models, "object")
})

test("getGeminiClient returns the same instance on repeated calls", (t) => {
  t.after(resetEnv)
  process.env.GEMINI_API_KEY = "test-key"

  const first = getGeminiClient()
  const second = getGeminiClient()

  assert.equal(first, second)
})

test("getGeminiApiKey throws when GEMINI_API_KEY is missing", (t) => {
  t.after(resetEnv)
  delete process.env.GEMINI_API_KEY

  assert.throws(
    () => __testOnlyGetGeminiApiKey(),
    /GEMINI_API_KEY is required/
  )
})
