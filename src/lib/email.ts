import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.EMAIL_FROM || "Chat Forms <noreply@chatforms.app>";

export async function sendResponseNotification({
  to,
  formTitle,
  quickSummary,
  sentiment,
  formId,
}: {
  to: string;
  formTitle: string;
  quickSummary: string;
  sentiment: string;
  formId: string;
}) {
  if (!resend) return;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `New response: ${formTitle}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="font-size: 18px; font-weight: 600; color: #111; margin: 0 0 16px;">
            New form response
          </h2>
          <p style="font-size: 14px; color: #666; margin: 0 0 20px;">
            Someone completed <strong>${formTitle}</strong>
          </p>
          <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 0 0 16px;">
            <p style="font-size: 13px; color: #888; margin: 0 0 4px;">Summary</p>
            <p style="font-size: 14px; color: #111; margin: 0;">${quickSummary}</p>
          </div>
          <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 0 0 20px;">
            <p style="font-size: 13px; color: #888; margin: 0 0 4px;">Sentiment</p>
            <p style="font-size: 14px; color: #111; margin: 0;">${sentiment}</p>
          </div>
          <p style="font-size: 12px; color: #999; margin: 0;">
            You received this because you have email notifications enabled for this form.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send notification email:", error);
  }
}
