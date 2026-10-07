import { z } from "zod";

const nameSchema = z.string().trim().min(1, "请输入名称").max(40, "名称最多 40 个字符");
export const categorySchema = z.object({
  name: nameSchema,
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "请选择六位十六进制颜色")
    .default("#0066df"),
});
export const tagSchema = z.object({ name: nameSchema });
export const updateCategorySchema = categorySchema.extend({ expected: categorySchema });
export type CategoryUpdateInput = z.infer<typeof updateCategorySchema>;
export const taxonomyIdSchema = z.object({ id: z.uuid() });
export type CategoryInput = z.infer<typeof categorySchema>;
export type TagInput = z.infer<typeof tagSchema>;
export type Tag = TagInput & { id: string; createdAt: string; postCount: number };
export type Category = Tag & { color: string };
export function taxonomyNameKey(name: string) {
  return name.normalize("NFC").toLowerCase();
}
