ALTER TABLE "site_settings" ALTER COLUMN "analytics" SET DEFAULT '{"googleSearchConsole":{"enabled":false,"verificationContent":""},"googleAnalytics":{"enabled":false,"measurementId":""},"umami":{"enabled":false,"scriptUrl":"","websiteId":""}}'::jsonb;--> statement-breakpoint
UPDATE "site_settings"
SET "analytics" = jsonb_set(
	"analytics",
	'{googleSearchConsole}',
	'{"enabled":false,"verificationContent":""}'::jsonb,
	true
)
WHERE NOT ("analytics" ? 'googleSearchConsole');
