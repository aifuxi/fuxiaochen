ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'user' NOT NULL;
--> statement-breakpoint
UPDATE "user"
SET "role" = 'user'
WHERE "role" IS DISTINCT FROM 'user';
--> statement-breakpoint
WITH "first_admin_candidate" AS (
  SELECT "id"
  FROM "user"
  ORDER BY "created_at" ASC, "id" ASC
  LIMIT 1
)
UPDATE "user"
SET "role" = 'admin'
WHERE "id" IN (SELECT "id" FROM "first_admin_candidate")
  AND NOT EXISTS (
    SELECT 1
    FROM "user"
    WHERE "role" = 'admin'
  );
--> statement-breakpoint
CREATE INDEX "user_role_idx" ON "user" USING btree ("role");
