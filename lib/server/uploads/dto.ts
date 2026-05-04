import { z } from "zod";

export const uploadUsageSchema = z.enum([
  "blog-cover",
  "site-logo",
  "site-avatar",
  "friend-avatar",
  "general-image",
]);

export const adminUploadPresignSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  contentType: z.string().trim().min(1).max(100),
  extension: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+$/)
    .max(16),
  usage: uploadUsageSchema,
});

export type UploadUsage = z.infer<typeof uploadUsageSchema>;
export type AdminUploadPresignInput = z.infer<typeof adminUploadPresignSchema>;
