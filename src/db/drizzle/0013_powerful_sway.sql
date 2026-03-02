ALTER TABLE "form_sessions" ADD COLUMN "flagged" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "form_sessions" ADD COLUMN "reviewed" boolean DEFAULT false;