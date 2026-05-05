CREATE TABLE "api_timing_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"event" text NOT NULL,
	"request_id" text NOT NULL,
	"scope" text NOT NULL,
	"operation" text,
	"method" text NOT NULL,
	"path" text NOT NULL,
	"status" integer NOT NULL,
	"user_id" text,
	"role" text,
	"auth_ms" integer DEFAULT 0 NOT NULL,
	"parse_ms" integer DEFAULT 0 NOT NULL,
	"service_ms" integer DEFAULT 0 NOT NULL,
	"response_ms" integer DEFAULT 0 NOT NULL,
	"total_ms" integer DEFAULT 0 NOT NULL,
	"proxy_auth_ms" integer,
	"error_code" text
);
--> statement-breakpoint
CREATE INDEX "api_timing_logs_created_at_idx" ON "api_timing_logs" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "api_timing_logs_request_id_idx" ON "api_timing_logs" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "api_timing_logs_scope_created_at_idx" ON "api_timing_logs" USING btree ("scope","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "api_timing_logs_status_created_at_idx" ON "api_timing_logs" USING btree ("status","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "api_timing_logs_total_ms_created_at_idx" ON "api_timing_logs" USING btree ("total_ms","created_at" DESC NULLS LAST);