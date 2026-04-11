import { handleRoute } from "@/lib/api/handle-route";
import { requireAdminApiSession } from "@/lib/api/require-api-session";
import { createSettingsHandler } from "@/lib/settings/settings-handler";
import { createSettingsRepository } from "@/lib/settings/settings-repository";
import { createSettingsService } from "@/lib/settings/settings-service";

const settingsHandler = createSettingsHandler({
  requireSession: requireAdminApiSession,
  service: createSettingsService(createSettingsRepository()),
});

export const GET = handleRoute(async (request: Request) => settingsHandler.getSettings(request));

export const PATCH = handleRoute(async (request: Request) => settingsHandler.updateSettings(request));
