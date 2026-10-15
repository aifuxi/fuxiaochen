import { z } from "zod";

// 这里只约束签名请求的 JSON 和 HTTP 头格式，不读取或校验上传文件。
export const uploadSchema = z.strictObject({
  contentType: z
    .string()
    .max(100)
    .regex(/^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/i),
});
export type UploadInput = z.infer<typeof uploadSchema>;
export type UploadTicket = {
  url: string;
  publicUrl: string;
  headers: Record<string, string>;
  expiresAt: string;
};
