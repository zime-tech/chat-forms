import {
  pgTable,
  text,
  timestamp,
  json,
  uuid,
  primaryKey,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { Message } from "@ai-sdk/react";
import { GenerateObjectResult } from "ai";
import { FormResponse } from "@/actions/form-builder";
import { FormAssistantResponse } from "@/actions/form-assistant";
import { AdapterAccount } from "next-auth/adapters";

export type ExtendedMessage = Message & {
  responseData?: FormResponse | FormAssistantResponse;
};

// tables
export const forms = pgTable("forms", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  tone: text("tone"),
  persona: text("persona"),
  keyInformation: text("key_information").array(),
  targetAudience: text("target_audience"),
  expectedCompletionTime: text("expected_completion_time"),
  aboutBusiness: text("about_business"),
  welcomeMessage: text("welcome_message"),
  callToAction: text("call_to_action"),
  endScreenMessage: text("end_screen_message"),
  messageHistory: json("message_history").$type<ExtendedMessage[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  userId: uuid("user_id").references(() => users.id),
});

export const formSessions = pgTable("form_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id").references(() => forms.id),
  messageHistory: json("message_history").$type<ExtendedMessage[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Authentication tables
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  password: text("password"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: timestamp("expires_at", { mode: "date" }),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// insert schemas
export const formSettingsInsertSchema = createInsertSchema(forms);
export const formSessionsInsertSchema = createInsertSchema(formSessions);
export const userInsertSchema = createInsertSchema(users);

// select schemas
export const formSettingsSelectSchema = createSelectSchema(forms);
export const formSessionsSelectSchema = createSelectSchema(formSessions);
export const userSelectSchema = createSelectSchema(users);

// types
export type FormSettings = typeof forms.$inferSelect;
export type FormSettingsInsert = typeof forms.$inferInsert;

export type FormSessions = typeof formSessions.$inferSelect;
export type FormSessionsInsert = typeof formSessions.$inferInsert;

export type User = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type AccountInsert = typeof accounts.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type SessionInsert = typeof sessions.$inferInsert;
