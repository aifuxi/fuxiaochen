import { requireAdminRequestSession } from "@/lib/auth-session";
import { withApiTiming } from "@/lib/server/api-timing";
import { ERROR_CODES } from "@/lib/server/http/error-codes";
import { AppError } from "@/lib/server/http/errors";
import { createSuccessResponse } from "@/lib/server/http/response";

import { adminUploadPresignSchema } from "./dto";
import { createUploadService, type UploadService } from "./service";

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

type UploadHandlerDeps = {
  service?: UploadService;
};

export function createAdminUploadHandlers({
  service = createUploadService(),
}: UploadHandlerDeps = {}) {
  return {
    async handleCreatePresignedUploadUrl(request: Request) {
      return withApiTiming(request, "admin.uploads.presign", async (timing) => {
        const session = await timing.time("auth", () =>
          requireAdminRequestSession(request),
        );
        timing.setSession(session);

        const body = await timing.time("parse", async () =>
          adminUploadPresignSchema.parse(await toJsonBody(request)),
        );
        const result = await timing.time("service", () =>
          service.createPresignedUploadUrl(body),
        );

        return timing.timeSync("response", () =>
          createSuccessResponse(result, undefined, 201),
        );
      });
    },
  };
}

const defaultAdminHandlers = createAdminUploadHandlers();

export const handleAdminCreatePresignedUploadUrl =
  defaultAdminHandlers.handleCreatePresignedUploadUrl;
