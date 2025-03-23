import { z } from "zod";

// Define our form response schema
export const formResponseSchema = z.object({
  responseToUser: z.string(),
  formSettingsUpdated: z.boolean(),
  formSettings: z.object({
    title: z.string(),
    tone: z.string(),
    persona: z.string(),
    journey: z.array(z.string()),
    targetAudience: z.string(),
    expectedCompletionTime: z.string(),
    aboutBusiness: z.string(),
    welcomeMessage: z.string(),
    callToAction: z.string(),
    endScreenMessage: z.string(),
  }),
});
