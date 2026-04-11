import { successResponse } from "@/lib/api/response";
import type { UpdateSettingsInput } from "@/lib/settings/settings-dto";
import { updateSettingsBodySchema } from "@/lib/settings/settings-dto";
import type { SettingsService } from "@/lib/settings/settings-service";

type SettingsHandlerDependencies = {
  requireSession: (request: Request) => Promise<unknown>;
  service: SettingsService;
};

export type SettingsHandler = {
  getSettings: (request: Request) => Promise<Response>;
  updateSettings: (request: Request) => Promise<Response>;
};

export function createSettingsHandler(dependencies: SettingsHandlerDependencies): SettingsHandler {
  return {
    async getSettings(request) {
      await dependencies.requireSession(request);

      const settings = await dependencies.service.getSettings();

      return successResponse(settings, {
        message: "Settings fetched successfully.",
      });
    },
    async updateSettings(request) {
      await dependencies.requireSession(request);

      const input = updateSettingsBodySchema.parse(await parseJsonBody<UpdateSettingsInput>(request));
      const settings = await dependencies.service.updateSettings(input);

      return successResponse(settings, {
        message: "Settings updated successfully.",
      });
    },
  };
}

async function parseJsonBody<T>(request: Request): Promise<T> {
  return (await request.json()) as T;
}
