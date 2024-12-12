import { ZodError } from "zod";

import { type ResponseType } from "@/types";

export function createSuccessResponse<T>(data: T): ResponseType<T> {
  return { code: 0, msg: "success", data };
}

export function createErrorResponse(error: unknown): ResponseType<null> {
  if (error instanceof ZodError) {
    return { code: -1, msg: "参数错误", data: null };
  }
  return { code: -1, msg: error, data: null };
}
