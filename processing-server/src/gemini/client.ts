import { GoogleGenAI } from "@google/genai"

let cachedClient: GoogleGenAI | null = null

function getGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is required")
  }

  return apiKey
}

export function getGeminiClient() {
  if (cachedClient) {
    // Log client lifecycle to trace reuse.
    console.info("Gemini client reused")
    return cachedClient
  }

  const apiKey = getGeminiApiKey()
  // # Reason: keep a single client instance for the worker process.
  cachedClient = new GoogleGenAI({ apiKey })
  // Log client lifecycle to trace creation.
  console.info("Gemini client created")
  return cachedClient
}

export function __testOnlyResetGeminiClient() {
  cachedClient = null
}

export function __testOnlyGetGeminiApiKey() {
  return getGeminiApiKey()
}
