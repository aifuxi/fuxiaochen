import { ERROR_BAD_REQUEST } from "@/constants";
import { loginSchema } from "@/features/auth";
import { createToken } from "@/lib/jwt";
import { getErrorMessages, getJsonBody } from "@/lib/request";
import { createErrorResponse, createResponse } from "@/lib/response";

export async function POST(req: Request) {
  const jsonBody = await getJsonBody(req);

  const result = await loginSchema.safeParseAsync(jsonBody);

  if (result.error) {
    const msg = getErrorMessages(result.error);

    return createErrorResponse(ERROR_BAD_REQUEST, String(msg));
  }

  return createResponse({
    token: createToken({
      email: result.data.email,
      userId: "123",
      role: "admin",
    }),
  });
}
