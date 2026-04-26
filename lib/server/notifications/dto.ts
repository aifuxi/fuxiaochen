import { z } from "zod";

const notificationStatusSchema = z.enum(["all", "unread"]).default("all");

export const adminNotificationListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(10),
  status: notificationStatusSchema,
});

export const adminNotificationIdParamsSchema = z.object({
  id: z.string().trim().min(1),
});

export const adminNotificationReadSchema = z.object({
  read: z.boolean(),
});

export type AdminNotificationListQuery = z.infer<
  typeof adminNotificationListQuerySchema
>;
export type AdminNotificationIdParams = z.infer<
  typeof adminNotificationIdParamsSchema
>;
export type AdminNotificationReadInput = z.infer<
  typeof adminNotificationReadSchema
>;
