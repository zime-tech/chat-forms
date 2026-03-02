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

export async function fireWebhook(
  webhookUrl: string,
  payload: WebhookPayload
): Promise<void> {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error(
        `Webhook failed: ${response.status} ${response.statusText} for ${webhookUrl}`
      );
    }
  } catch (error) {
    // Log but don't throw — webhook failures shouldn't break the form flow
    console.error(`Webhook error for ${webhookUrl}:`, error);
  }
}
