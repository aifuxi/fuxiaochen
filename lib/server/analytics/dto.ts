import { z } from "zod";

export const adminAnalyticsRangeSchema = z
  .union([
    z.literal("7"),
    z.literal("30"),
    z.literal("90"),
    z.literal("365"),
    z.literal(7),
    z.literal(30),
    z.literal(90),
    z.literal(365),
  ])
  .default("30")
  .transform(Number)
  .pipe(z.union([z.literal(7), z.literal(30), z.literal(90), z.literal(365)]));

export const adminAnalyticsQuerySchema = z.object({
  range: adminAnalyticsRangeSchema,
});

export type AdminAnalyticsRange = z.infer<typeof adminAnalyticsRangeSchema>;
export type AdminAnalyticsQuery = z.infer<typeof adminAnalyticsQuerySchema>;
