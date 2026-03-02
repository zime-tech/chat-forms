ALTER TABLE "forms" ADD COLUMN "status" text DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "closed_at" timestamp;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "max_responses" integer;