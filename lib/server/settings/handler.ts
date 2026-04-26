import { revalidatePath } from "next/cache";

import {
  requireAdminRequestSession,
  requireRequestSession,
} from "@/lib/auth-session";
import { ERROR_CODES } from "@/lib/server/http/error-codes";
import { toErrorResponse } from "@/lib/server/http/error-handler";
import { AppError } from "@/lib/server/http/errors";
import { createSuccessResponse } from "@/lib/server/http/response";

import { adminSiteSettingsUpdateSchema } from "./dto";
import { toAdminSiteSettings, toPublicSiteSettings } from "./mappers";
import {
  createSettingsService,
  type SettingsService,
  type SettingsServiceDeps,
} from "./service";

const revalidatedPaths = [
  "/",
  "/about",
  "/blog",
  "/projects",
  "/friends",
  "/changelog",
] as const;

const toJsonBody = async (request: Request) => {
  try {
    return (await request.json()) as unknown;
  } catch {
    throw new AppError(
      ERROR_CODES.COMMON_INVALID_REQUEST,
      "Invalid JSON body",
      400,
    );
  }
};

const revalidateSiteSettingsPaths = () => {
  revalidatePath("/", "layout");

  for (const path of revalidatedPaths) {
    revalidatePath(path);
  }
};

type SettingsHandlerDeps = {
  service?: SettingsService;
  serviceDeps?: SettingsServiceDeps;
};

export function createAdminSettingsHandlers({
  serviceDeps,
  service = createSettingsService(serviceDeps),
}: SettingsHandlerDeps = {}) {
  return {
    async handleGetSettings(request: Request) {
      try {
        await requireRequestSession(request);

        const result = await service.getSettings();

        return createSuccessResponse(
          toAdminSiteSettings(result.settings, result.row),
        );
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async handleUpdateSettings(request: Request) {
      try {
        await requireAdminRequestSession(request);

        const body = adminSiteSettingsUpdateSchema.parse(
          await toJsonBody(request),
        );
        const result = await service.updateSettings(body);

        revalidateSiteSettingsPaths();

        return createSuccessResponse(
          toAdminSiteSettings(result.settings, result.row),
        );
      } catch (error) {
        return toErrorResponse(error);
      }
    },
  };
}

export function createPublicSettingsHandlers({
  serviceDeps,
  service = createSettingsService(serviceDeps),
}: SettingsHandlerDeps = {}) {
  return {
    async handleGetSettings() {
      try {
        const result = await service.getSettings();

        return createSuccessResponse(
          toPublicSiteSettings(result.settings, result.row),
        );
      } catch (error) {
        return toErrorResponse(error);
      }
    },
  };
}

const defaultAdminHandlers = createAdminSettingsHandlers();
const defaultPublicHandlers = createPublicSettingsHandlers();

export const handleAdminGetSettings = defaultAdminHandlers.handleGetSettings;
export const handleAdminUpdateSettings =
  defaultAdminHandlers.handleUpdateSettings;
export const handlePublicGetSettings = defaultPublicHandlers.handleGetSettings;
