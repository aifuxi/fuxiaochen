CREATE TABLE "blog_likes" (
	"blog_id" text NOT NULL,
	"visitor_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	CONSTRAINT "blog_likes_pkey" PRIMARY KEY("blog_id","visitor_id")
);
--> statement-breakpoint
CREATE TABLE "blog_view_dedup" (
	"blog_id" text NOT NULL,
	"visitor_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "blog_view_dedup_pkey" PRIMARY KEY("blog_id","visitor_id")
);
--> statement-breakpoint
CREATE TABLE "request_guard_states" (
	"key" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "request_guard_states_count_check" CHECK ("request_guard_states"."count" >= 0)
);
--> statement-breakpoint
ALTER TABLE "blog_likes" ADD CONSTRAINT "blog_likes_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "public"."blogs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_view_dedup" ADD CONSTRAINT "blog_view_dedup_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "public"."blogs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blog_likes_visitor_id_idx" ON "blog_likes" USING btree ("visitor_id");--> statement-breakpoint
CREATE INDEX "blog_view_dedup_expires_at_idx" ON "blog_view_dedup" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "request_guard_states_expires_at_idx" ON "request_guard_states" USING btree ("expires_at");