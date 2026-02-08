import { createClient } from "@supabase/supabase-js"
import type { SupabaseClientLike } from "./fines"
import type { SupabaseStorageClientLike } from "./storage"

type SupabaseConfig = {
  url: string
  serviceRoleKey: string
}

function getSupabaseConfig(): SupabaseConfig {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  // # Reason: allow worker to run when only NEXT_PUBLIC_* envs are configured.
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url) {
    throw new Error("SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is required")
  }

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is required"
    )
  }

  return { url, serviceRoleKey }
}

export function createSupabaseClient(
  config: SupabaseConfig = getSupabaseConfig()
): SupabaseClientLike & SupabaseStorageClientLike {
  // # Reason: Avoid TS deep-instantiation errors by typing to the minimal API
  // surface we actually use in this codebase.
  const createClientUntyped =
    // # Reason: Cast away heavy generics that can trigger TS2589 during build.
    createClient as unknown as (
      url: string,
      key: string,
      options: {
        auth?: { autoRefreshToken?: boolean; persistSession?: boolean }
      }
    ) => SupabaseClientLike & SupabaseStorageClientLike

  return createClientUntyped(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export function __testOnlyGetSupabaseConfig() {
  return getSupabaseConfig()
}
