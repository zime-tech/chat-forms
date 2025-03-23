CREATE TABLE "forms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"tone" text NOT NULL,
	"persona" text NOT NULL,
	"journey" text NOT NULL,
	"target_audience" text NOT NULL,
	"expected_completion_time" text NOT NULL,
	"about_business" text NOT NULL,
	"welcome_message" text NOT NULL,
	"call_to_action" text NOT NULL,
	"end_screen_message" text NOT NULL,
	"message_history" json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
