import { PDFDocument } from "pdf-lib"

export async function countPdfPagesFromFile(file: File): Promise<number> {
  const fileBuffer = await file.arrayBuffer()
  const pdfDocument = await PDFDocument.load(fileBuffer, {
    // # Reason: Some uploaded legal PDFs are encrypted but still readable.
    ignoreEncryption: true
  })

  return pdfDocument.getPageCount()
}
