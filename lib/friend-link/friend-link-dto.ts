import { FriendLinkStatus } from "@/generated/prisma/enums";
import { z } from "zod";

type FriendLinkAvatarAssetRecord = {
  altText: string | null;
  id: string;
  originalUrl: string | null;
};

type FriendLinkRecord = {
  avatarAsset: FriendLinkAvatarAssetRecord | null;
  avatarAssetId: string | null;
  createdAt: Date;
  description: string;
  domain: string | null;
  id: string;
  siteName: string;
  siteUrl: string;
  sortOrder: number;
  status: (typeof FriendLinkStatus)[keyof typeof FriendLinkStatus];
  subtitle: string | null;
  updatedAt: Date;
};

const friendLinkStatusSchema = z.enum([
  FriendLinkStatus.Approved,
  FriendLinkStatus.Offline,
  FriendLinkStatus.Pending,
  FriendLinkStatus.Rejected,
]);

const normalizedStringIdSchema = z
  .string({
    error: "Friend link id must be a string.",
  })
  .trim()
  .min(1, "Friend link id is required.")
  .max(191, "Friend link id is too long.");

const normalizedRelationIdSchema = z.preprocess((value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    return trimmedValue.length > 0 ? trimmedValue : null;
  }

  return value;
}, z.string().max(191, "Relation id is too long.").nullable().optional());

const normalizedTextSchema = z.preprocess((value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    return trimmedValue.length > 0 ? trimmedValue : null;
  }

  return value;
}, z.string().nullable().optional());

const normalizedSortOrderSchema = z.coerce
  .number({
    error: "Sort order must be a number.",
  })
  .int("Sort order must be an integer.")
  .min(0, "Sort order must be at least 0.");

const normalizedSiteNameSchema = z
  .string()
  .trim()
  .min(1, "Site name is required.")
  .max(120, "Site name must not exceed 120 characters.");

const normalizedSiteUrlSchema = z
  .string()
  .trim()
  .min(1, "Site URL is required.")
  .max(255, "Site URL must not exceed 255 characters.")
  .refine(isValidUrl, "Site URL must be a valid URL.");

const normalizedSubtitleSchema = normalizedTextSchema.pipe(
  z.string().max(120, "Subtitle must not exceed 120 characters.").nullable().optional(),
);

const normalizedDomainSchema = normalizedTextSchema.pipe(
  z.string().max(120, "Domain must not exceed 120 characters.").nullable().optional(),
);

const normalizedDescriptionSchema = z
  .string()
  .trim()
  .min(1, "Description is required.")
  .max(5000, "Description is too long.");

export const friendLinkIdSchema = normalizedStringIdSchema;

export const listFriendLinksQuerySchema = z.object({
  keyword: z
    .string()
    .trim()
    .transform((value) => value || undefined)
    .optional(),
  page: z.coerce
    .number({
      error: "Page must be a number.",
    })
    .int("Page must be an integer.")
    .min(1, "Page must be at least 1.")
    .default(1),
  pageSize: z.coerce
    .number({
      error: "Page size must be a number.",
    })
    .int("Page size must be an integer.")
    .min(1, "Page size must be at least 1.")
    .max(50, "Page size must not exceed 50.")
    .default(10),
  status: friendLinkStatusSchema.optional(),
});

export const createFriendLinkBodySchema = z.object({
  avatarAssetId: normalizedRelationIdSchema,
  description: normalizedDescriptionSchema,
  domain: normalizedDomainSchema,
  siteName: normalizedSiteNameSchema,
  siteUrl: normalizedSiteUrlSchema,
  sortOrder: normalizedSortOrderSchema.default(0),
  status: friendLinkStatusSchema.default(FriendLinkStatus.Approved),
  subtitle: normalizedSubtitleSchema,
});

export const updateFriendLinkBodySchema = z
  .object({
    avatarAssetId: normalizedRelationIdSchema,
    description: normalizedDescriptionSchema.optional(),
    domain: normalizedDomainSchema,
    siteName: normalizedSiteNameSchema.optional(),
    siteUrl: normalizedSiteUrlSchema.optional(),
    sortOrder: normalizedSortOrderSchema.optional(),
    status: friendLinkStatusSchema.optional(),
    subtitle: normalizedSubtitleSchema,
  })
  .refine(
    (value) =>
      value.avatarAssetId !== undefined ||
      value.description !== undefined ||
      value.domain !== undefined ||
      value.siteName !== undefined ||
      value.siteUrl !== undefined ||
      value.sortOrder !== undefined ||
      value.status !== undefined ||
      value.subtitle !== undefined,
    {
      message: "At least one field must be provided.",
      path: [],
    },
  );

export type FriendLinkAvatarAssetDto = {
  altText: string | null;
  id: string;
  originalUrl: string | null;
};

export type FriendLinkDto = {
  avatarAsset: FriendLinkAvatarAssetDto | null;
  avatarAssetId: string | null;
  createdAt: string;
  description: string;
  domain: string | null;
  id: string;
  siteName: string;
  siteUrl: string;
  sortOrder: number;
  status: (typeof FriendLinkStatus)[keyof typeof FriendLinkStatus];
  subtitle: string | null;
  updatedAt: string;
};

export type CreateFriendLinkInput = z.infer<typeof createFriendLinkBodySchema>;
export type ListFriendLinksQuery = z.infer<typeof listFriendLinksQuerySchema>;
export type UpdateFriendLinkInput = z.infer<typeof updateFriendLinkBodySchema>;

export function toFriendLinkDto(friendLink: FriendLinkRecord): FriendLinkDto {
  return {
    avatarAsset: friendLink.avatarAsset,
    avatarAssetId: friendLink.avatarAssetId,
    createdAt: friendLink.createdAt.toISOString(),
    description: friendLink.description,
    domain: friendLink.domain,
    id: friendLink.id,
    siteName: friendLink.siteName,
    siteUrl: friendLink.siteUrl,
    sortOrder: friendLink.sortOrder,
    status: friendLink.status,
    subtitle: friendLink.subtitle,
    updatedAt: friendLink.updatedAt.toISOString(),
  };
}

function isValidUrl(value: string) {
  return URL.canParse(value);
}
