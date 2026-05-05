import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth";
import { withApiTiming } from "@/lib/server/api-timing";
import {
  applyLoginGuardCookie,
  loginGuard,
} from "@/lib/server/auth/login-guard";
import {
  applyRegisterGuardCookie,
  registerGuard,
} from "@/lib/server/auth/register-guard";
import { AppError } from "@/lib/server/http/errors";

const authHandlers = toNextJsHandler(auth);
const SIGN_IN_EMAIL_PATH = "/api/auth/sign-in/email";
const SIGN_UP_EMAIL_PATH = "/api/auth/sign-up/email";

const isEmailSignInRequest = (request: Request) =>
  new URL(request.url).pathname === SIGN_IN_EMAIL_PATH;

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
      message: "认证保护暂时不可用，请稍后再试。",
    },
    { status: 503 },
  );
};

async function handleEmailSignIn(request: Request) {
  const attempt = await loginGuard.validateSignInRequest(request);
  const response = await authHandlers.POST(request);

  if (response.status === 401) {
    await loginGuard.recordFailedSignIn(attempt);
  } else if (response.ok) {
    await loginGuard.clearFailedSignIn(attempt);
  }

  return applyLoginGuardCookie(response, attempt);
}

async function handleEmailSignUp(request: Request) {
  const guardResult = await registerGuard.validateSignUpRequest(request);
  const response = await authHandlers.POST(request);

  if (response.ok) {
    await registerGuard.recordSuccessfulSignUp(guardResult);
  }

  return applyRegisterGuardCookie(response, guardResult);
}

export function GET(request: Request) {
  return withApiTiming(
    request,
    "auth.get",
    (timing) => timing.time("service", () => authHandlers.GET(request)),
    {
      onError: createAuthGuardErrorResponse,
      scope: "auth",
    },
  );
}

export async function POST(request: Request) {
  return withApiTiming(
    request,
    "auth.post",
    (timing) => {
      const authFlow = timing.timeSync("parse", () => {
        if (isEmailSignInRequest(request)) {
          return "email-sign-in";
        }

        if (isEmailSignUpRequest(request)) {
          return "email-sign-up";
        }

        return "default";
      });

      return timing.time("service", () => {
        if (authFlow === "email-sign-in") {
          return handleEmailSignIn(request);
        }

        if (authFlow === "email-sign-up") {
          return handleEmailSignUp(request);
        }

        return authHandlers.POST(request);
      });
    },
    {
      onError: createAuthGuardErrorResponse,
      scope: "auth",
    },
  );
}
