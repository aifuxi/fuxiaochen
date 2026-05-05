import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim().length === 0 ? undefined : value;

const optionalNonEmptyString = z.preprocess(
  emptyToUndefined,
  z.string().trim().min(1).optional(),
);

const optionalDate = z.preprocess(emptyToUndefined, z.coerce.date().optional());

export const apiTimingLogEventSchema = z.enum([
  "api_timing",
  "api_proxy_timing",
]);

export const apiTimingLogScopeSchema = z.enum([
  "admin",
  "public",
  "auth",
  "other",
]);

export const apiTimingLogStatusClassSchema = z.enum([
  "2xx",
  "3xx",
  "4xx",
  "5xx",
]);

export const adminApiTimingLogListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  scope: apiTimingLogScopeSchema.optional(),
  event: apiTimingLogEventSchema.optional(),
  method: optionalNonEmptyString.transform((value) => value?.toUpperCase()),
  statusClass: apiTimingLogStatusClassSchema.optional(),
  status: z.coerce.number().int().min(100).max(599).optional(),
  requestId: optionalNonEmptyString,
  path: optionalNonEmptyString,
  operation: optionalNonEmptyString,
  userId: optionalNonEmptyString,
  errorCode: optionalNonEmptyString,
  minTotalMs: z.coerce.number().int().min(0).optional(),
  from: optionalDate,
  to: optionalDate,
});

export type ApiTimingLogEvent = z.infer<typeof apiTimingLogEventSchema>;
export type ApiTimingLogScope = z.infer<typeof apiTimingLogScopeSchema>;
export type ApiTimingLogStatusClass = z.infer<
  typeof apiTimingLogStatusClassSchema
>;
export type AdminApiTimingLogListQuery = z.infer<
  typeof adminApiTimingLogListQuerySchema
>;
