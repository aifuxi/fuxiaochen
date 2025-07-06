import { NextResponse } from "next/server";

import { ERROR_SUCCESS } from "@/constants";

export function createResponse(data: unknown) {
  const { code, message } = ERROR_SUCCESS;

  return NextResponse.json({
    code,
    message,
    data,
  });
}

export function createErrorResponse(errorResp: BaseResponse, msg?: string) {
  return NextResponse.json({
    ...errorResp,
    message: msg || errorResp.message,
  });
}
