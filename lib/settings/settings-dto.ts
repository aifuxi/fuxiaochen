import { z } from "zod";

type CommentSettingsRecord = {
  allowAnonymous: boolean;
  enabled: boolean;
  maxReplyDepth: number;
  moderationRequired: boolean;
  nestedRepliesEnabled: boolean;
  updatedAt: Date;
};

type SettingsRecord = {
  accentColor: string | null;
  blogDescription: string | null;
  blogName: string;
  blogUrl: string;
  commentSettings: CommentSettingsRecord | null;
  contactEmail: string | null;
  createdAt: Date;
  defaultMetaDescription: string | null;
  defaultMetaTitle: string | null;
  fontFamily: string | null;
  googleAnalyticsId: string | null;
  id: number;
  languageCode: string;
  sitemapUrl: string | null;
  theme: string;
  timezone: string;
  updatedAt: Date;
};

const nullableTextSchema = z.preprocess((value) => {
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

const requiredTextSchema = (fieldName: string, maxLength: number) =>
  z.string().trim().min(1, `${fieldName} is required.`).max(maxLength, `${fieldName} must not exceed ${maxLength} characters.`);

const optionalUrlSchema = z.preprocess((value) => {
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
}, z.url("URL must be valid.").nullable().optional());

const requiredUrlSchema = z.url("Site URL must be valid.").max(255, "Site URL must not exceed 255 characters.");

const optionalEmailSchema = z.preprocess((value) => {
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
}, z.email("Contact email must be valid.").max(255, "Contact email must not exceed 255 characters.").nullable().optional());

const optionalHexColorSchema = nullableTextSchema.pipe(
  z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Accent color must be a valid hex color.")
    .nullable()
    .optional(),
);

const commentSettingsSchema = z.object({
  allowAnonymous: z.boolean(),
  enabled: z.boolean(),
  maxReplyDepth: z.coerce
    .number({
      error: "Max reply depth must be a number.",
    })
    .int("Max reply depth must be an integer.")
    .min(1, "Max reply depth must be at least 1.")
    .max(10, "Max reply depth must not exceed 10."),
  moderationRequired: z.boolean(),
  nestedRepliesEnabled: z.boolean(),
});

export const updateSettingsBodySchema = z.object({
  accentColor: optionalHexColorSchema,
  blogDescription: nullableTextSchema,
  blogName: requiredTextSchema("Site name", 120),
  blogUrl: requiredUrlSchema,
  commentSettings: commentSettingsSchema,
  contactEmail: optionalEmailSchema,
  defaultMetaDescription: nullableTextSchema.pipe(
    z.string().max(500, "Meta description must not exceed 500 characters.").nullable().optional(),
  ),
  defaultMetaTitle: nullableTextSchema.pipe(
    z.string().max(255, "Meta title must not exceed 255 characters.").nullable().optional(),
  ),
  fontFamily: nullableTextSchema.pipe(
    z.string().max(64, "Font family must not exceed 64 characters.").nullable().optional(),
  ),
  googleAnalyticsId: nullableTextSchema.pipe(
    z.string().max(32, "Google Analytics id must not exceed 32 characters.").nullable().optional(),
  ),
  languageCode: requiredTextSchema("Language code", 16),
  sitemapUrl: optionalUrlSchema.pipe(z.string().max(255, "Sitemap URL must not exceed 255 characters.").nullable().optional()),
  theme: requiredTextSchema("Theme", 16),
  timezone: requiredTextSchema("Timezone", 64),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsBodySchema>;

export type CommentSettingsDto = {
  allowAnonymous: boolean;
  enabled: boolean;
  maxReplyDepth: number;
  moderationRequired: boolean;
  nestedRepliesEnabled: boolean;
  updatedAt: string | null;
};

export type SettingsDto = {
  accentColor: string | null;
  blogDescription: string | null;
  blogName: string;
  blogUrl: string;
  commentSettings: CommentSettingsDto;
  contactEmail: string | null;
  createdAt: string;
  defaultMetaDescription: string | null;
  defaultMetaTitle: string | null;
  fontFamily: string | null;
  googleAnalyticsId: string | null;
  id: number;
  languageCode: string;
  sitemapUrl: string | null;
  theme: string;
  timezone: string;
  updatedAt: string;
};

export function toSettingsDto(settings: SettingsRecord): SettingsDto {
  return {
    accentColor: settings.accentColor,
    blogDescription: settings.blogDescription,
    blogName: settings.blogName,
    blogUrl: settings.blogUrl,
    commentSettings: settings.commentSettings
      ? {
          allowAnonymous: settings.commentSettings.allowAnonymous,
          enabled: settings.commentSettings.enabled,
          maxReplyDepth: settings.commentSettings.maxReplyDepth,
          moderationRequired: settings.commentSettings.moderationRequired,
          nestedRepliesEnabled: settings.commentSettings.nestedRepliesEnabled,
          updatedAt: settings.commentSettings.updatedAt.toISOString(),
        }
      : {
          allowAnonymous: false,
          enabled: true,
          maxReplyDepth: 3,
          moderationRequired: true,
          nestedRepliesEnabled: true,
          updatedAt: null,
        },
    contactEmail: settings.contactEmail,
    createdAt: settings.createdAt.toISOString(),
    defaultMetaDescription: settings.defaultMetaDescription,
    defaultMetaTitle: settings.defaultMetaTitle,
    fontFamily: settings.fontFamily,
    googleAnalyticsId: settings.googleAnalyticsId,
    id: settings.id,
    languageCode: settings.languageCode,
    sitemapUrl: settings.sitemapUrl,
    theme: settings.theme,
    timezone: settings.timezone,
    updatedAt: settings.updatedAt.toISOString(),
  };
}
