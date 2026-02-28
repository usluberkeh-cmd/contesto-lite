import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

import { sendTriggerFailureAlert } from "@/lib/server/ops-alerts";
import { triggerProcessingWebhook } from "@/lib/server/processing-webhook";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const triggerPayloadSchema = z.object({
  fineId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const requestBody: unknown = await request.json();
    const parsedBody = triggerPayloadSchema.safeParse(requestBody);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Identifiant d'amende invalide." },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const { data: fine, error: fineError } = await supabase
      .from("fines")
      .select("id, file_name")
      .eq("id", parsedBody.data.fineId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fineError) {
      console.error("Failed to load fine before webhook trigger:", fineError);
      return NextResponse.json(
        { error: "Impossible de vérifier l'amende." },
        { status: 500 },
      );
    }

    if (!fine) {
      return NextResponse.json({ error: "Amende introuvable." }, { status: 404 });
    }

    // # Reason: Payload must be generated server-side and signed with the shared secret.
    const webhookResult = await triggerProcessingWebhook({
      fineId: fine.id,
      fileName: fine.file_name ?? undefined,
    });

    if (!webhookResult.ok) {
      console.error("Processing webhook rejected request:", {
        status: webhookResult.status,
        body: webhookResult.rawBody,
        fineId: fine.id,
      });
      await sendTriggerFailureAlert({
        fineId: fine.id,
        userId: user.id,
        webhookStatus: webhookResult.status,
        webhookResponseBody: webhookResult.rawBody,
        reason: "webhook_non_2xx",
      });
      return NextResponse.json(
        { error: "Impossible de démarrer le traitement OCR." },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { status: "queued", jobId: webhookResult.jobId ?? null },
      { status: 202 },
    );
  } catch (error) {
    console.error("Failed to trigger fine processing:", error);
    await sendTriggerFailureAlert({
      fineId: "unknown",
      reason: "trigger_route_exception",
      webhookResponseBody: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Erreur lors du déclenchement du traitement." },
      { status: 500 },
    );
  }
}
