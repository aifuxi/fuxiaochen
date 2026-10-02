import { z } from "zod";

export const versionSchema = z
  .number()
  .int()
  .min(1)
  .max(Number.MAX_SAFE_INTEGER - 1);
export const webUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => {
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password;
    } catch {
      return false;
    }
  }, "请输入不含凭据的完整 HTTP(S) 链接。");
export const httpsUrlSchema = webUrlSchema.refine(
  (value) => value.startsWith("https://"),
  "请输入 HTTPS 链接。",
);
export const imageUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => {
    if (!value) return true;
    if (value.startsWith("/") && !value.startsWith("//") && !/[\\\s?#]/.test(value)) return true;
    return httpsUrlSchema.safeParse(value).success;
  }, "请输入 HTTPS 图片链接或站内绝对路径。");
export const listQuerySchema = z.object({
  q: z.string().trim().max(200).default(""),
  page: z.coerce.number().int().min(1).max(1_000_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(8),
});
export const idSchema = z.object({ id: z.uuid() });
export const deleteVersionSchema = z.object({ version: z.coerce.number().pipe(versionSchema) });
export type Page<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};
