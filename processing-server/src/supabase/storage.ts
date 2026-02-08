type SupabaseStorageError = { message: string }

export type SupabaseStorageDownloadResponse = {
  data: Blob | ArrayBuffer | null
  error: SupabaseStorageError | null
}

export type SupabaseStorageClientLike = {
  storage: {
    from: (bucket: string) => {
      download: (path: string) => PromiseLike<SupabaseStorageDownloadResponse>
    }
  }
}

export async function downloadStorageFile(
  supabase: SupabaseStorageClientLike,
  bucket: string,
  path: string
): Promise<Buffer> {
  const response = await supabase.storage.from(bucket).download(path)

  if (response.error) {
    throw new Error(`Supabase storage download failed: ${response.error.message}`)
  }

  if (!response.data) {
    throw new Error("Supabase storage download returned no data")
  }

  // # Reason: Supabase returns Blob in browser-like environments; tests may supply ArrayBuffer.
  const arrayBuffer =
    response.data instanceof ArrayBuffer
      ? response.data
      : await response.data.arrayBuffer()

  return Buffer.from(arrayBuffer)
}
