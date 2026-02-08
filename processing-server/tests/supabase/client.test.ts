import assert from "node:assert/strict"
import test from "node:test"

import {
  __testOnlyGetSupabaseConfig,
  createSupabaseClient
} from "../../src/supabase/client"

const originalUrl = process.env.SUPABASE_URL
const originalServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const originalPublicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const originalPublicAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function resetEnv() {
  if (originalUrl) {
    process.env.SUPABASE_URL = originalUrl
  } else {
    delete process.env.SUPABASE_URL
  }

  if (originalServiceKey) {
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceKey
  } else {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
  }

  if (originalPublicUrl) {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalPublicUrl
  } else {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
  }

  if (originalPublicAnonKey) {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalPublicAnonKey
  } else {
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }
}

test("createSupabaseClient returns a client", (t) => {
  t.after(resetEnv)
  process.env.SUPABASE_URL = "https://example.supabase.co"
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key"

  const client = createSupabaseClient()

  assert.equal(typeof client.from, "function")
})

test("getSupabaseConfig accepts a trailing slash in the URL", (t) => {
  t.after(resetEnv)
  process.env.SUPABASE_URL = "https://example.supabase.co/"
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key"

  const config = __testOnlyGetSupabaseConfig()

  assert.equal(config.url, "https://example.supabase.co/")
})

test("getSupabaseConfig throws when SUPABASE_URL is missing", (t) => {
  t.after(resetEnv)
  delete process.env.SUPABASE_URL
  delete process.env.NEXT_PUBLIC_SUPABASE_URL
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key"

  assert.throws(
    () => __testOnlyGetSupabaseConfig(),
    /SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is required/
  )
})

test("getSupabaseConfig falls back to NEXT_PUBLIC_SUPABASE_URL", (t) => {
  t.after(resetEnv)
  delete process.env.SUPABASE_URL
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co"
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key"

  const config = __testOnlyGetSupabaseConfig()

  assert.equal(config.url, "https://example.supabase.co")
})

test("getSupabaseConfig falls back to NEXT_PUBLIC_SUPABASE_ANON_KEY", (t) => {
  t.after(resetEnv)
  process.env.SUPABASE_URL = "https://example.supabase.co"
  delete process.env.SUPABASE_SERVICE_ROLE_KEY
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key"

  const config = __testOnlyGetSupabaseConfig()

  assert.equal(config.serviceRoleKey, "anon-key")
})

test("getSupabaseConfig throws when key is missing", (t) => {
  t.after(resetEnv)
  process.env.SUPABASE_URL = "https://example.supabase.co"
  delete process.env.SUPABASE_SERVICE_ROLE_KEY
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  assert.throws(
    () => __testOnlyGetSupabaseConfig(),
    /SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is required/
  )
})
