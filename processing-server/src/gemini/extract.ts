import {z} from "zod/v3";
import { TrafficFineSchema } from "./schemas";
import {zodToJsonSchema} from "zod-to-json-schema";

const INLINE_REQUEST_LIMIT_BYTES = 20 * 1024 * 1024
const DEFAULT_PROMPT_TEXT = "Summarize this document"

type GenerateContentRequest = {
  model: string
  contents: Array<
    | { inlineData: { mimeType: string; data: string } }
    | { fileData: { mimeType: string; fileUri: string }}
    | { text: string }
  >
  config?: {
    responseMimeType?: string
    responseSchema?: Record<string, unknown>
  }
}



//Blob is a built‑in type representing binary data (like files) with an associated MIME type. 
type GeminiUploadFileParams = {
  file: string | globalThis.Blob
  config?: { mimeType?: string }
}

type GeminiUploadFileResult = {
  name?: string
  uri?: string
  sizeBytes?: string
  mimeType?: string
}

export type GeminiClientLike = {
  models: {
    generateContent: (request: GenerateContentRequest) => Promise<{ text?: string }>
  }
  files: { 
    upload: (params: GeminiUploadFileParams) => Promise<GeminiUploadFileResult>
  }
}

export type ExtractDataFromPdfOptions<
TSchema extends z.ZodTypeAny = z.ZodTypeAny
// TSchema - The generic type variable name
// extends z.ZodTypeAny - Constraint: TSchema must be a Zod schema type
// = z.ZodTypeAny - Default: If no type is provided, it defaults to z.ZodTypeAny
> = {
  model: string
  // Default prompt is applied when omitted.
  prompt?: string
  responseSchema?: TSchema
}


export async function extractDataFromPdf <
TSchema extends z.ZodTypeAny = typeof TrafficFineSchema
// TSchema: generic function variable name
// extends z.ZodTypeAny - Constraint: TSchema must be a Zod schema type
// If no type is provided, it defaults to TrafficFineSchema
>(
  pdfBuffer: Buffer,
  geminiClient: GeminiClientLike,
  options: ExtractDataFromPdfOptions<TSchema>,
): Promise<z.infer<TSchema>> {
// z.infer<TSchema> is a TypeScript utility that extracts the TypeScript type from a Zod schema. 
// It converts runtime validation into compile-time types.

  // # Reason: Apply shared default prompt text for PDF processing.
  const promptText = options.prompt ?? DEFAULT_PROMPT_TEXT
  console.info("Gemini extraction request received:", {
    model: options.model,
    promptLength: promptText.length,
    pdfBytes: pdfBuffer.byteLength
  })  

  const promptBytes = Buffer.byteLength(promptText, "utf8")
  const estimatedInlineBytes = Math.ceil(pdfBuffer.byteLength * 4 / 3) + promptBytes
  const useFileApi = estimatedInlineBytes > INLINE_REQUEST_LIMIT_BYTES
  // # Reason: Keep inline requests under the 20 MB total request limit.
  console.info("Gemini extraction request sizing:", {
    pdfBytes: pdfBuffer.byteLength,
    promptBytes,
    estimatedInlineBytes,
    inlineLimitBytes: INLINE_REQUEST_LIMIT_BYTES,
    useFileApi
  })
     

  const schema: z.ZodTypeAny = options.responseSchema ?? TrafficFineSchema
  // # Reason: zod-to-json-schema expects zod/v3 types; ensure schema is typed accordingly.
  console.info("Gemini response schema selected:", {
    source: options.responseSchema ? "custom" : "default"
  })
  const jsonSchema = zodToJsonSchema(schema)

  //It creates a variable named contents and says its type must match the contents field of GenerateContentRequest
  let contents: GenerateContentRequest["contents"]
  if (useFileApi) {
    // # Reason: Large PDFs must be uploaded to avoid exceeding inline request limits.
    console.info("Gemini file upload starting:", {
      pdfBytes: pdfBuffer.byteLength,
      mimeType: "application/pdf"
    })

    // TODO (CORE LOGIC): Upload the PDF via the file API and capture the upload response.
    const uploadedFile = await geminiClient.files.upload({
      //In this context, Blob is a binary large object used to represent raw binary data (files, buffers, bytes) in JavaScript.
      //  It lets you upload data without needing a file path, which is especially useful in browsers or serverless environments.
      // # Reason: Convert Buffer to a Uint8Array-backed BlobPart to avoid
      // SharedArrayBuffer typing mismatches in TS.
      file: new Blob([Uint8Array.from(pdfBuffer)], {type: "application/pdf"}),
      config: {mimeType: "application/pdf"}
    })

    // TODO (CORE LOGIC): Derive the file URI (or fallback identifier) from the upload response.
    const fileUri = uploadedFile.uri ?? uploadedFile.name

    // TODO (CORE LOGIC): Validate that a file URI was obtained.
    if (!fileUri) {
      throw new Error("Gemini file upload returned no file URI")
    }
    console.info("Gemini file upload complete:", {
      fileUri,
      fileName: uploadedFile.name,
      fileSizeBytes: uploadedFile.sizeBytes
    })
    // TODO (CORE LOGIC): Build the contents array using the file reference and prompt text.
    contents = [
      {fileData: {mimeType: "application/pdf", fileUri}},
      {text: promptText}
    ]
  } else {
    // TODO (CORE LOGIC): Base64-encode the PDF buffer for inline use.
    const inlineData = pdfBuffer.toString("base64")
    console.info("Gemini inline PDF payload prepared:", {
      base64Length: inlineData.length
    })
    // TODO (CORE LOGIC): Build the contents array using inline data and prompt text.
    contents = [
      {inlineData: {mimeType: "application/pdf", data: inlineData}},
      {text: promptText}
    ]
  }


  //Build config with responseMimeType: "application/json" and optionally attach responseSchema.
  const request: GenerateContentRequest= {
    model : options.model,
    contents: contents,
    config: 
      {
      responseMimeType: "application/json",
      responseSchema: jsonSchema,
      // This response Schema will be the zod one defined on chatgpt
      } 
    }

    // Encode pdfBuffer to base64 text
    // mime type means the type of the media file.

    const response = await geminiClient.models.generateContent(request)

    if(!response.text) {
      throw(new Error("No response from Gemini API"));
    }

    // Process the response as needed
    console.info("Gemini extraction response received",
      response.text
    )

    try {
      const parsed = JSON.parse(response.text) 
      const validatedData = schema.parse(parsed) 
      return validatedData as z.infer<TSchema>

    } catch (err) {
      throw new Error(`Gemini returned invalid JSON: ${(err as Error).message}`);
    }

} 


