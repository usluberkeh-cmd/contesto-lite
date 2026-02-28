import { createHmac } from "node:crypto";

interface ProcessingWebhookPayload {
  fineId: string;
  fileName?: string;
}

interface ProcessingWebhookConfig {
  secret: string;
  webhookUrl: string;
}

interface ProcessingWebhookResult {
  ok: boolean;
  status: number;
  rawBody: string;
  jobId?: string;
}

const SIGNATURE_PREFIX = "sha256=";

const normalizeWebhookUrl = (value: string): string => {
  return value.endsWith("/") ? `${value}webhook` : `${value}/webhook`;
};

const resolveWebhookConfig = (): ProcessingWebhookConfig => {
  const explicitWebhookUrl = process.env.PROCESSING_WEBHOOK_URL?.trim();
  const processingServerUrl = process.env.PROCESSING_SERVER_URL?.trim();
  const webhookUrl = explicitWebhookUrl
    ? explicitWebhookUrl
    : processingServerUrl
      ? normalizeWebhookUrl(processingServerUrl)
      : undefined;

  if (!webhookUrl) {
    throw new Error(
      "PROCESSING_WEBHOOK_URL (or PROCESSING_SERVER_URL) is not configured",
    );
  }

  const secret =
    process.env.WEBHOOK_SECRET?.trim();
  // # Reason: Keep backward compatibility with existing environments that already define WEBHOOK_SECRET.
  if (!secret) {
    throw new Error(
      "WEBHOOK_SECRET is not configured",
    );
  }

  return { secret, webhookUrl };
};

const getJobIdFromWebhookResponse = (value: unknown): string | undefined => {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const candidate = (value as Record<string, unknown>).jobId;
  return typeof candidate === "string" && candidate.length > 0
    ? candidate
    : undefined;
};

export async function triggerProcessingWebhook(
  payload: ProcessingWebhookPayload,
): Promise<ProcessingWebhookResult> {
  const { secret, webhookUrl } = resolveWebhookConfig();
  const body = JSON.stringify(payload);
  const signature =
    SIGNATURE_PREFIX + createHmac("sha256", secret).update(body).digest("hex");

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-webhook-signature": signature,
    },
    body,
    cache: "no-store",
  });

  const rawBody = await response.text();
  let parsedBody: unknown;

  if (rawBody.length > 0) {
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      parsedBody = undefined;
    }
  }

  return {
    ok: response.ok,
    status: response.status,
    rawBody,
    jobId: getJobIdFromWebhookResponse(parsedBody),
  };
}
