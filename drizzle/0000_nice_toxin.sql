CREATE TABLE "blog_tags" (
	"blog_id" text NOT NULL,
	"tag_id" text NOT NULL,
	CONSTRAINT "blog_tags_pkey" PRIMARY KEY("blog_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "blogs" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"content" text NOT NULL,
	"cover_image" text DEFAULT '' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"read_time_minutes" integer DEFAULT 1 NOT NULL,
	"category_id" text NOT NULL,
	CONSTRAINT "blogs_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	CONSTRAINT "categories_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "changelogs" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"version" text NOT NULL,
	"title" text NOT NULL,
	"release_date" timestamp with time zone NOT NULL,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"changes" text[] DEFAULT '{}'::text[] NOT NULL,
	CONSTRAINT "changelogs_version_key" UNIQUE("version")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"long_description" text NOT NULL,
	"image" text DEFAULT '' NOT NULL,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"github_url" text,
	"live_url" text,
	"featured" boolean DEFAULT false NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"year" integer NOT NULL,
	CONSTRAINT "projects_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	CONSTRAINT "tags_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "blog_tags" ADD CONSTRAINT "blog_tags_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "public"."blogs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_tags" ADD CONSTRAINT "blog_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blog_tags_tag_id_idx" ON "blog_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "blogs_category_id_idx" ON "blogs" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "blogs_published_published_at_idx" ON "blogs" USING btree ("published","published_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "changelogs_release_date_idx" ON "changelogs" USING btree ("release_date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "projects_published_year_idx" ON "projects" USING btree ("published","year" DESC NULLS LAST);