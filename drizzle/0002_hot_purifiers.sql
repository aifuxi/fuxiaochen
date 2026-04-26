CREATE TABLE "friends" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"avatar" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"category" text NOT NULL,
	CONSTRAINT "friends_url_key" UNIQUE("url")
);
--> statement-breakpoint
INSERT INTO "friends" ("id", "created_at", "updated_at", "name", "url", "avatar", "description", "category") VALUES
	('1', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z', 'Anthony Fu', 'https://antfu.me', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', 'A fanatical open sourcerer. Core team of Vue, Vite, and Nuxt.', 'developer'),
	('2', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z', 'Josh Comeau', 'https://joshwcomeau.com', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', 'Software developer and educator, focused on React and CSS.', 'developer'),
	('3', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z', 'Sarah Drasner', 'https://sarahdrasnerdesign.com', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', 'VP of Developer Experience at Netlify. Author and speaker.', 'developer'),
	('4', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z', 'Addy Osmani', 'https://addyosmani.com', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', 'Engineering Manager at Google working on Chrome.', 'developer'),
	('5', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z', 'Cassie Evans', 'https://cassie.codes', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', 'Creative developer and SVG animation enthusiast.', 'designer'),
	('6', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z', 'Dan Abramov', 'https://overreacted.io', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop', 'Working on React. Co-author of Redux and Create React App.', 'developer'),
	('7', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z', 'Wes Bos', 'https://wesbos.com', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop', 'Full Stack Developer and teacher. Makes web development courses.', 'creator'),
	('8', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z', 'Una Kravets', 'https://una.im', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop', 'Developer Advocate at Google. CSS and web standards expert.', 'designer');
--> statement-breakpoint
CREATE INDEX "friends_category_name_idx" ON "friends" USING btree ("category","name");--> statement-breakpoint
CREATE INDEX "friends_updated_at_idx" ON "friends" USING btree ("updated_at" DESC NULLS LAST);
