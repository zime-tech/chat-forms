CREATE INDEX "idx_form_sessions_form_id" ON "form_sessions" USING btree ("form_id");--> statement-breakpoint
CREATE INDEX "idx_form_sessions_created_at" ON "form_sessions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_forms_user_id" ON "forms" USING btree ("user_id");