import { z } from "zod";

import type { Page } from "@/lib/admin/schema";

import { listQuerySchema, versionSchema } from "@/lib/admin/schema";
export const releaseTypes = {
  feature: "功能特性",
  fix: "缺陷修复",
  performance: "性能优化",
  security: "安全加固",
} as const;
export const releaseTypeSchema = z.enum(["feature", "fix", "performance", "security"]);
export const releaseChangesSchema = z
  .array(z.string().trim().min(1).max(200, "每条更新最多200字符。"))
  .max(20, "最多20条更新。");
export const releaseSchema = z.strictObject({
  version: z.string().trim().min(1, "请输入版本文案。").max(80),
  title: z.string().trim().min(1, "请输入更新主题。").max(200),
  type: releaseTypeSchema,
  changes: releaseChangesSchema,
});
export type ReleaseType = z.infer<typeof releaseTypeSchema>;
export type ReleaseInput = z.infer<typeof releaseSchema>;
export const releaseStatusSchema = z.enum(["published", "withdrawn"]);
export type ReleaseStatus = z.infer<typeof releaseStatusSchema>;
export const releaseQuerySchema = listQuerySchema.extend({
  status: releaseStatusSchema.optional(),
});
export const releaseUpdateSchema = releaseSchema.extend({ revision: versionSchema });
export const releaseVisibilitySchema = z.strictObject({
  status: releaseStatusSchema,
  revision: versionSchema,
});
export type ReleaseUpdateInput = z.infer<typeof releaseUpdateSchema>;
export type ReleaseVisibilityInput = z.infer<typeof releaseVisibilitySchema>;
export type ReleaseLog = ReleaseInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: z.infer<typeof releaseStatusSchema>;
  revision: number;
};
export type ReleaseList = Page<ReleaseLog>;
