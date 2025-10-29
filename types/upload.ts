import z from "zod";

import { type BaseResponse } from "./base";

export const getUploadInfoSchema = z.object({
  filename: z.string().min(1, { message: "长度不能少于1个字符" }),
  contentType: z.string().min(1, { message: "长度不能少于1个字符" }),
});

export type GetUploadInfoRequest = z.infer<typeof getUploadInfoSchema>;

export type GetUploadInfoData = {
  signatureUrl: string;
  contentType: string;
};

export type GetUploadInfoResponse = BaseResponse<GetUploadInfoData>;
