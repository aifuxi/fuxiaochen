import { revalidatePath, revalidateTag } from "next/cache";

import {
  requireAdminRequestSession,
  requireRequestSession,
} from "@/lib/auth-session";
import { withApiTiming } from "@/lib/server/api-timing";
import { ERROR_CODES } from "@/lib/server/http/error-codes";
import { AppError } from "@/lib/server/http/errors";
import { createSuccessResponse } from "@/lib/server/http/response";

import { adminSiteSettingsUpdateSchema } from "./dto";
import { toAdminSiteSettings, toPublicSiteSettings } from "./mappers";
import {
  SITE_SETTINGS_CACHE_TAG,
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
  "/login",
  "/register",
  "/admin",
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
  revalidateTag(SITE_SETTINGS_CACHE_TAG, "max");
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
      return withApiTiming(request, "admin.settings.get", async (timing) => {
        const session = await timing.time("auth", () =>
          requireRequestSession(request),
        );
        timing.setSession(session);

        const result = await timing.time("service", () =>
          service.getSettings(),
        );

        return timing.timeSync("response", () =>
          createSuccessResponse(
            toAdminSiteSettings(result.settings, result.row),
          ),
        );
      });
    },
    async handleUpdateSettings(request: Request) {
      return withApiTiming(request, "admin.settings.update", async (timing) => {
        const session = await timing.time("auth", () =>
          requireAdminRequestSession(request),
        );
        timing.setSession(session);

        const body = await timing.time("parse", async () =>
          adminSiteSettingsUpdateSchema.parse(await toJsonBody(request)),
        );
        const result = await timing.time("service", async () => {
          const updatedSettings = await service.updateSettings(body);
          revalidateSiteSettingsPaths();

          return updatedSettings;
        });

        return timing.timeSync("response", () =>
          createSuccessResponse(
            toAdminSiteSettings(result.settings, result.row),
          ),
        );
      });
    },
  };
}

export function createPublicSettingsHandlers({
  serviceDeps,
  service = createSettingsService(serviceDeps),
}: SettingsHandlerDeps = {}) {
  return {
    async handleGetSettings(request?: Request) {
      return withApiTiming(request, "public.settings.get", async (timing) => {
        const result = await timing.time("service", () =>
          service.getSettings(),
        );

        return timing.timeSync("response", () =>
          createSuccessResponse(
            toPublicSiteSettings(result.settings, result.row),
          ),
        );
      });
    },
  };
}

const defaultAdminHandlers = createAdminSettingsHandlers();
const defaultPublicHandlers = createPublicSettingsHandlers();

export const handleAdminGetSettings = defaultAdminHandlers.handleGetSettings;
export const handleAdminUpdateSettings =
  defaultAdminHandlers.handleUpdateSettings;
export const handlePublicGetSettings = defaultPublicHandlers.handleGetSettings;
