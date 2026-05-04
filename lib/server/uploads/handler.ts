import { requireAdminRequestSession } from "@/lib/auth-session";
import { ERROR_CODES } from "@/lib/server/http/error-codes";
import { toErrorResponse } from "@/lib/server/http/error-handler";
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
      try {
        await requireAdminRequestSession(request);

        const body = adminUploadPresignSchema.parse(await toJsonBody(request));
        const result = await service.createPresignedUploadUrl(body);

        return createSuccessResponse(result, undefined, 201);
      } catch (error) {
        return toErrorResponse(error);
      }
    },
  };
}

const defaultAdminHandlers = createAdminUploadHandlers();

export const handleAdminCreatePresignedUploadUrl =
  defaultAdminHandlers.handleCreatePresignedUploadUrl;
