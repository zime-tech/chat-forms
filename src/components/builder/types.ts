import { Message } from "@ai-sdk/react";

// Extended message type to match the server-side type
export interface ExtendedMessage extends Message {
  responseData?: FormResponse;
}

export interface FormResponse {
  formSettings: FormSettings;
}

export interface FormSettings {
  title: string;
  tone: string;
  persona: string;
  targetAudience: string;
  journey: string[];
  aboutBusiness: string;
  welcomeMessage: string;
  callToAction: string;
  endScreenMessage: string;
  expectedCompletionTime: string;
}
