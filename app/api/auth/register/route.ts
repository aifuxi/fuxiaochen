import {
  ERROR_ALREADY_EXIST,
  ERROR_BAD_REQUEST,
  ERROR_INTERNAL,
} from "@/constants";
import { registerSchema } from "@/features/auth";
import { createUser, getUserByEmail } from "@/features/user";
import { getErrorMessages, getJsonBody } from "@/lib/request";
import { createErrorResponse, createResponse } from "@/lib/response";

export async function POST(req: Request) {
  const jsonBody = await getJsonBody(req);

  const result = registerSchema.safeParse(jsonBody);

  if (result.error) {
    const msg = getErrorMessages(result.error);

    return createErrorResponse(ERROR_BAD_REQUEST, String(msg));
  }

  const exitedUser = await getUserByEmail(result.data.email);

  if (exitedUser) {
    return createErrorResponse(ERROR_ALREADY_EXIST, "邮箱已注册");
  }

  const createdUser = await createUser(result.data);

  if (!createdUser) {
    return createErrorResponse(ERROR_INTERNAL, "创建用户失败，请稍后重试");
  }

  return createResponse({
    email: createdUser.email,
  });
}
