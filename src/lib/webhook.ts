import { StructuredAnswer } from "@/db/schema";

interface WebhookPayload {
  formId: string;
  sessionId: string;
  completedAt: string;
  quickSummary: string;
  detailedSummary: string;
  overallSentiment: string;
  structuredAnswers: StructuredAnswer[];
}

const MAX_ATTEMPTS = 3;
const RETRY_DELAYS = [1000, 2000];

async function attemptWebhook(webhookUrl: string, body: string): Promise<boolean> {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    signal: AbortSignal.timeout(10000),
  });
  return response.ok;
}

export async function fireWebhook(
  webhookUrl: string,
  payload: WebhookPayload
): Promise<void> {
  const body = JSON.stringify(payload);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const ok = await attemptWebhook(webhookUrl, body);
      if (ok) return;
      console.error(
        `Webhook attempt ${attempt}/${MAX_ATTEMPTS} failed (non-OK status) for ${webhookUrl}`
      );
    } catch (error) {
      console.error(
        `Webhook attempt ${attempt}/${MAX_ATTEMPTS} error for ${webhookUrl}:`,
        error
      );
    }

    if (attempt < MAX_ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS[attempt - 1]));
    }
  }
}
