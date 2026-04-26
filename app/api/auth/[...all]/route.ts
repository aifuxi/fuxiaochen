import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth";
import {
  applyRegisterGuardCookie,
  registerGuard,
} from "@/lib/server/auth/register-guard";
import { AppError } from "@/lib/server/http/errors";

const authHandlers = toNextJsHandler(auth);
const SIGN_UP_EMAIL_PATH = "/api/auth/sign-up/email";

const isEmailSignUpRequest = (request: Request) =>
  new URL(request.url).pathname === SIGN_UP_EMAIL_PATH;

const createAuthGuardErrorResponse = (error: unknown) => {
  if (error instanceof AppError) {
    return Response.json(
      {
        code: error.code,
        message: error.message,
      },
      { status: error.status },
    );
  }

  return Response.json(
    {
      code: "COMMON_INTERNAL_ERROR",
      message: "注册保护暂时不可用，请稍后再试。",
    },
    { status: 503 },
  );
};

export const GET = authHandlers.GET;

export async function POST(request: Request) {
  if (!isEmailSignUpRequest(request)) {
    return authHandlers.POST(request);
  }

  try {
    const guardResult = await registerGuard.validateSignUpRequest(request);
    const response = await authHandlers.POST(request);

    return applyRegisterGuardCookie(response, guardResult);
  } catch (error) {
    return createAuthGuardErrorResponse(error);
  }
}
