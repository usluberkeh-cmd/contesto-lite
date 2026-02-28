const MIN_WHATSAPP_NUMBER_LENGTH = 8

export function normalizeWhatsAppNumber(input: string): string {
  return input.replace(/\D/g, "")
}

export function buildWhatsAppUrl({
  phoneNumber,
  message,
}: {
  phoneNumber: string
  message: string
}): string | null {
  const normalizedNumber = normalizeWhatsAppNumber(phoneNumber)

  if (normalizedNumber.length < MIN_WHATSAPP_NUMBER_LENGTH) {
    return null
  }

  const trimmedMessage = message.trim()

  if (!trimmedMessage) {
    return `https://wa.me/${normalizedNumber}`
  }

  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(trimmedMessage)}`
}
