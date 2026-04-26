CREATE TABLE "blog_daily_stats" (
	"blog_id" text NOT NULL,
	"metric_date" date NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"like_count" integer DEFAULT 0 NOT NULL,
	"unlike_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "blog_daily_stats_pkey" PRIMARY KEY("blog_id","metric_date"),
	CONSTRAINT "blog_daily_stats_view_count_check" CHECK ("blog_daily_stats"."view_count" >= 0),
	CONSTRAINT "blog_daily_stats_like_count_check" CHECK ("blog_daily_stats"."like_count" >= 0),
	CONSTRAINT "blog_daily_stats_unlike_count_check" CHECK ("blog_daily_stats"."unlike_count" >= 0)
);
--> statement-breakpoint
ALTER TABLE "blog_daily_stats" ADD CONSTRAINT "blog_daily_stats_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "public"."blogs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blog_daily_stats_metric_date_idx" ON "blog_daily_stats" USING btree ("metric_date");