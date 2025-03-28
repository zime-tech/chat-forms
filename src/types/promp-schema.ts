import { z } from "zod";

export const formSettingsSchema = z.object({
  title: z.string(),
  tone: z.string(),
  persona: z.string(),
  keyInformation: z.array(z.string()),
  targetAudience: z.string(),
  expectedCompletionTime: z.string(),
  aboutBusiness: z.string(),
  welcomeMessage: z.string(),
  callToAction: z.string(),
  endScreenMessage: z.string(),
});

// Define our form response schema
export const formResponseSchema = z.object({
  responseToUser: z.string(),
  formSettingsUpdated: z.boolean(),
  formSettings: formSettingsSchema,
});

export const formAssistantResponseSchema = z.object({
  responseToUser: z.string(),
  formCompleted: z.boolean(),
  summary: z
    .object({
      quickSummary: z.string(),
      detailedSummary: z.string(),
      overallSentiment: z.string(),
    })
    .optional(),
});
