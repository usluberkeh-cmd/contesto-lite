import assert from "node:assert/strict"
import test from "node:test"

import {
  downloadStorageFile,
  type SupabaseStorageClientLike
} from "../../src/supabase/storage"

type DownloadCall = {
  bucket: string
  path: string
}

function createMockStorage(response: {
  data: Blob | ArrayBuffer | null
  error: { message: string } | null
}) {
  const calls: DownloadCall[] = []
  const client: SupabaseStorageClientLike = {
    storage: {
      from: (bucket) => ({
        download: async (path) => {
          calls.push({ bucket, path })
          return response
        }
      })
    }
  }

  return { client, calls }
}

test("downloadStorageFile returns a Buffer for Blob data", async () => {
  const { client, calls } = createMockStorage({
    data: new Blob(["pdf-bytes"]),
    error: null
  })

  const result = await downloadStorageFile(client, "fine-documents", "a.pdf")

  assert.equal(calls.length, 1)
  assert.equal(calls[0].bucket, "fine-documents")
  assert.equal(calls[0].path, "a.pdf")
  assert.equal(result.toString(), "pdf-bytes")
})

test("downloadStorageFile handles ArrayBuffer data", async () => {
  const buffer = new Uint8Array([1, 2, 3]).buffer
  const { client } = createMockStorage({ data: buffer, error: null })

  const result = await downloadStorageFile(client, "fine-documents", "b.pdf")

  assert.ok(result.equals(Buffer.from([1, 2, 3])))
})

test("downloadStorageFile throws on storage error", async () => {
  const { client } = createMockStorage({
    data: null,
    error: { message: "nope" }
  })

  await assert.rejects(
    () => downloadStorageFile(client, "fine-documents", "c.pdf"),
    /Supabase storage download failed: nope/
  )
})
