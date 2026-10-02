import { z } from "zod";

import {
  imageUrlSchema,
  listQuerySchema,
  versionSchema,
  webUrlSchema,
  type Page,
} from "@/lib/admin/schema";
export const friendCategories = ["技术博客", "生活感悟", "创意设计"] as const;
export const friendStatuses = ["pending", "approved", "rejected"] as const;
export const friendStatusLabels = {
  pending: "待审核",
  approved: "已通过",
  rejected: "已拒绝",
} as const;
export const friendSchema = z.strictObject({
  name: z.string().trim().min(1, "请输入网站名称。").max(100),
  url: webUrlSchema,
  avatar: imageUrlSchema,
  description: z.string().trim().max(500),
  category: z.enum(friendCategories),
  status: z.enum(friendStatuses),
  enabled: z.boolean(),
});
// 新增始终待审核；编辑使用相同表单，可由管理员明确调整状态。
export const createFriendSchema = friendSchema.omit({ status: true });
export const updateFriendSchema = friendSchema.extend({ version: versionSchema });
export const friendQuerySchema = listQuerySchema.extend({
  category: z.enum(friendCategories).optional(),
  status: z.enum(friendStatuses).optional(),
  enabled: z.enum(["true", "false"]).optional(),
});
export type FriendInput = z.infer<typeof friendSchema>;
export type CreateFriendInput = z.infer<typeof createFriendSchema>;
export type UpdateFriendInput = z.infer<typeof updateFriendSchema>;
export type FriendQuery = z.infer<typeof friendQuerySchema>;
export type FriendLink = FriendInput & {
  id: string;
  version: number;
  createdAt: string;
  updatedAt: string;
};
export type FriendList = Page<FriendLink>;
