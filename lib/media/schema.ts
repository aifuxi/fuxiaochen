import { z } from "zod";

export const IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const ATTACHMENT_MAX_BYTES = 50 * 1024 * 1024;
export const mediaKindSchema = z.enum(["image", "attachment"]);
export const mediaIdSchema = z.object({ id: z.uuid() });
export const uploadSchema = z
  .object({
    name: z
      .string()
      .min(1)
      .max(255)
      .refine(
        (name) =>
          name.isWellFormed() &&
          Array.from(name).every(
            (char) =>
              char.charCodeAt(0) >= 32 &&
              char.charCodeAt(0) !== 127 &&
              char !== "/" &&
              char !== "\\",
          ) &&
          Boolean(name.trim()),
        "文件名无效。",
      ),
    kind: mediaKindSchema,
    bytes: z.number().int().min(1).max(ATTACHMENT_MAX_BYTES),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .refine((input) => input.kind !== "image" || input.bytes <= IMAGE_MAX_BYTES, "图片最多 10 MiB。");
export const mediaQuerySchema = z.object({
  q: z.string().trim().max(200).default(""),
  kind: mediaKindSchema.optional(),
  page: z.coerce.number().int().min(1).max(1_000_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(12),
});
export type UploadInput = z.infer<typeof uploadSchema>;
export type MediaQuery = z.infer<typeof mediaQuerySchema>;
export type MediaItem = {
  id: string;
  name: string;
  kind: z.infer<typeof mediaKindSchema>;
  bytes: number;
  mime: string;
  width: number | null;
  height: number | null;
  createdAt: string;
  uploadedAt: string;
  status: "ready" | "deleting";
  url: string | null;
};
export type MediaList = {
  items: MediaItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};
export type UploadTicket = {
  id: string;
  url: string;
  headers: Record<string, string>;
  expiresAt: string;
};
export function fileKind(file: Pick<File, "name" | "type">): "image" | "attachment" {
  return /\.(jpe?g|png|webp|avif|gif)$/i.test(file.name) ||
    /^(image\/(jpeg|png|webp|avif|gif))$/.test(file.type)
    ? "image"
    : "attachment";
}
