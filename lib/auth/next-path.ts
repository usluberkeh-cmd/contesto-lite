const DEFAULT_NEXT_PATH = "/";

export const sanitizeNextPath = (
  candidate: string | null | undefined
): string => {
  if (!candidate) {
    return DEFAULT_NEXT_PATH;
  }

  const trimmed = candidate.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return DEFAULT_NEXT_PATH;
  }

  try {
    const parsed = new URL(trimmed, "https://contesto.local");
    if (parsed.origin !== "https://contesto.local") {
      return DEFAULT_NEXT_PATH;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return DEFAULT_NEXT_PATH;
  }
};

export const buildLoginPathWithNext = (nextPath: string): string => {
  const safePath = sanitizeNextPath(nextPath);
  return `/login?next=${encodeURIComponent(safePath)}`;
};
