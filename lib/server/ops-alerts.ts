type TriggerFailureAlertPayload = {
  fineId: string;
  userId?: string;
  webhookStatus?: number;
  webhookResponseBody?: string;
  reason: string;
};

type ResendSendResponse = {
  id?: string;
  error?: {
    name?: string;
    message?: string;
  };
};

const DEFAULT_ALERT_RECIPIENT = "admin@contesto.fr";
const DEFAULT_ALERT_FROM = "Contesto <fines@contact.contesto.fr>";
const RESEND_SEND_EMAIL_ENDPOINT = "https://api.resend.com/emails";
const ALERT_DEDUP_WINDOW_MS = 10 * 60 * 1000;
const recentAlertKeys = new Map<string, number>();

function buildAlertKey(payload: TriggerFailureAlertPayload) {
  return `${payload.fineId}:${payload.reason}`;
}

function shouldSendAlert(payload: TriggerFailureAlertPayload) {
  const key = buildAlertKey(payload);
  const now = Date.now();
  const lastSentAt = recentAlertKeys.get(key);

  if (lastSentAt && now - lastSentAt < ALERT_DEDUP_WINDOW_MS) {
    return false;
  }

  recentAlertKeys.set(key, now);
  return true;
}

function getAlertRecipients() {
  const rawRecipients = process.env.TEAM_NOTIFICATION_EMAILS;
  if (!rawRecipients) {
    return [DEFAULT_ALERT_RECIPIENT];
  }

  const recipients = rawRecipients
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  if (recipients.length === 0) {
    return [DEFAULT_ALERT_RECIPIENT];
  }

  return recipients;
}

function truncateText(value: string | undefined, maxLength: number) {
  if (!value) {
    return "";
  }

  return value.length > maxLength
    ? `${value.slice(0, maxLength)}…`
    : value;
}

export async function sendTriggerFailureAlert(
  payload: TriggerFailureAlertPayload,
) {
  if (!shouldSendAlert(payload)) {
    return;
  }

  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  if (!resendApiKey) {
    console.warn(
      "[OpsAlert] RESEND_API_KEY missing; trigger failure alert not sent.",
    );
    return;
  }

  const recipients = getAlertRecipients();
  const from = process.env.ALERTS_FROM_EMAIL?.trim() || DEFAULT_ALERT_FROM;
  const subject = `Alerte déclenchement analyse — dossier ${payload.fineId}`;
  const webhookBody = truncateText(payload.webhookResponseBody, 3000);
  const text = [
    "Le déclenchement de l'analyse a échoué.",
    `fineId: ${payload.fineId}`,
    payload.userId ? `userId: ${payload.userId}` : null,
    payload.webhookStatus ? `webhookStatus: ${payload.webhookStatus}` : null,
    `reason: ${payload.reason}`,
    webhookBody ? `webhookBody: ${webhookBody}` : null,
    `timestamp: ${new Date().toISOString()}`,
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n");

  const response = await fetch(RESEND_SEND_EMAIL_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: recipients,
      subject,
      text,
      tags: [
        { name: "alert_type", value: "trigger_failure" },
        { name: "source", value: "web_app" },
      ],
    }),
    signal: AbortSignal.timeout(5000),
    cache: "no-store",
  });

  if (!response.ok) {
    const rawBody = await response.text();
    console.error("[OpsAlert] Failed to send trigger failure alert:", {
      status: response.status,
      body: rawBody,
      fineId: payload.fineId,
    });
    return;
  }

  const responseBody = (await response.json()) as ResendSendResponse;
  console.info("[OpsAlert] Trigger failure alert sent:", {
    fineId: payload.fineId,
    emailId: responseBody.id ?? null,
  });
}
