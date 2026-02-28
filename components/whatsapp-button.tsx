import Image from "next/image";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const DEFAULT_WHATSAPP_MESSAGE =
  "Bonjour, j'ai une question concernant mes amendes";

export function WhatsAppButton() {
  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() ?? "";
  const defaultMessage =
    process.env.NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE?.trim();
  const message = defaultMessage || DEFAULT_WHATSAPP_MESSAGE;
  const whatsappUrl = buildWhatsAppUrl({ phoneNumber, message });

  if (!whatsappUrl) {
    return null;
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter sur WhatsApp"
      className="group fixed bottom-6 right-6 z-[999] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 md:bottom-8 md:right-8"
    >
      <Image
        src="/images/whatsapp-logo.svg"
        alt=""
        width={28}
        height={28}
        aria-hidden="true"
      />
      <span className="pointer-events-none absolute right-16 hidden whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-sm text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 md:block">
        Contactez-nous sur WhatsApp
      </span>
    </a>
  );
}
