import { z } from "zod";

import { noAdminPermission } from "@/app/actions";

import { getUploadInfoSchema } from "@/types/upload";

import { ERROR_MESSAGE_MAP } from "@/constants/error";
import { aliOSS } from "@/lib/ali-oss";
import { createResponse } from "@/lib/common";

export async function GET(request: Request) {
  if (await noAdminPermission()) {
    return createResponse({ error: ERROR_MESSAGE_MAP.noPermission });
  }

  const url = new URL(request.url);
  const query = Object.fromEntries(url.searchParams);
  const result = await getUploadInfoSchema.safeParseAsync(query);

  if (!result.success) {
    const error = z.prettifyError(result.error);
    return createResponse({ error });
  }

  // @ts-expect-error 忽略类型错误，因为 aliOSS 库的类型定义有问题 实际有这个方法
  const signatureUrl = await aliOSS.signatureUrlV4(
    "PUT",
    3600,
    {
      headers: {
        "Content-Type": result.data.contentType,
      }, // 请根据实际发送的请求头设置此处的请求头
    },
    `${process.env.OSS_UPLOAD_DIR}/${result.data.filename}`,
  );

  return createResponse({
    data: { signatureUrl, contentType: result.data.contentType },
  });
}
