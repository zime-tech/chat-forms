import { pgTable, text, timestamp, json, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { Message } from "@ai-sdk/react";
import { GenerateObjectResult } from "ai";
import { FormResponse } from "@/actions/form-manager";
import { FormAssistantResponse } from "@/actions/form-assistant";

export type ExtendedMessage = Message & {
  responseData?: FormResponse | FormAssistantResponse;
};

// tables
export const forms = pgTable("forms", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  tone: text("tone"),
  persona: text("persona"),
  journey: text("journey").array(),
  targetAudience: text("target_audience"),
  expectedCompletionTime: text("expected_completion_time"),
  aboutBusiness: text("about_business"),
  welcomeMessage: text("welcome_message"),
  callToAction: text("call_to_action"),
  endScreenMessage: text("end_screen_message"),
  messageHistory: json("message_history").$type<ExtendedMessage[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const formSessions = pgTable("form_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id").references(() => forms.id),
  messageHistory: json("message_history").$type<ExtendedMessage[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// insert schemas
export const formSettingsInsertSchema = createInsertSchema(forms);
export const formSessionsInsertSchema = createInsertSchema(formSessions);

// select schemas
export const formSettingsSelectSchema = createSelectSchema(forms);
export const formSessionsSelectSchema = createSelectSchema(formSessions);

// types
export type FormSettings = typeof forms.$inferSelect;
export type FormSettingsInsert = typeof forms.$inferInsert;

export type FormSessions = typeof formSessions.$inferSelect;
export type FormSessionsInsert = typeof formSessions.$inferInsert;
