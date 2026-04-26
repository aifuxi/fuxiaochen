import { z } from "zod";

export const SITE_SETTINGS_ID = "default";

const nonEmptyString = z.string().trim().min(1);
const stringList = z.array(nonEmptyString).default([]);
const urlOrEmpty = z
  .string()
  .trim()
  .refine(
    (value) => value.length === 0 || z.string().url().safeParse(value).success,
    {
      message: "Invalid URL",
    },
  );
const urlOrPath = z
  .string()
  .trim()
  .refine(
    (value) =>
      value.startsWith("/") || z.string().url().safeParse(value).success,
    {
      message: "Must be an absolute path or URL",
    },
  );

const seoPageSchema = z.object({
  title: nonEmptyString,
  description: nonEmptyString,
});

const generalSchema = z.object({
  siteName: nonEmptyString,
  siteUrl: z.string().trim().url(),
  siteDescription: nonEmptyString,
  logoUrl: urlOrPath,
  avatarUrl: urlOrPath,
  email: z.string().trim().email(),
});

const seoSchema = z.object({
  defaultTitle: nonEmptyString,
  defaultDescription: nonEmptyString,
  pages: z.object({
    home: seoPageSchema,
    about: seoPageSchema,
    blog: seoPageSchema,
    projects: seoPageSchema,
    friends: seoPageSchema,
    changelog: seoPageSchema,
  }),
});

const profileSchema = z.object({
  heroTitle: nonEmptyString,
  heroRole: nonEmptyString,
  heroSummary: nonEmptyString,
  heroDescription: nonEmptyString,
  aboutTitle: nonEmptyString,
  aboutRole: nonEmptyString,
  aboutLocation: nonEmptyString,
  bioTitle: nonEmptyString,
  bio: stringList,
  experienceTitle: nonEmptyString,
  experience: z.array(
    z.object({
      role: nonEmptyString,
      company: nonEmptyString,
      period: nonEmptyString,
      description: nonEmptyString,
    }),
  ),
  skillsTitle: nonEmptyString,
  skills: z.object({
    languages: stringList,
    frontend: stringList,
    backend: stringList,
    tools: stringList,
  }),
  beyondCodeTitle: nonEmptyString,
  interests: z.array(
    z.object({
      title: nonEmptyString,
      description: nonEmptyString,
    }),
  ),
  ctaTitle: nonEmptyString,
  ctaDescription: nonEmptyString,
});

const socialSchema = z.object({
  githubUrl: urlOrEmpty,
  twitterUrl: urlOrEmpty,
  linkedinUrl: urlOrEmpty,
  juejinUrl: urlOrEmpty,
  bilibiliUrl: urlOrEmpty,
  sourceCodeUrl: urlOrEmpty,
});

const complianceSchema = z.object({
  icpNumber: z.string().trim(),
  icpLink: urlOrEmpty,
  policeNumber: z.string().trim(),
  policeLink: urlOrEmpty,
});

const analyticsSchema = z.object({
  googleSearchConsole: z
    .object({
      enabled: z.boolean(),
      verificationContent: z.string().trim(),
    })
    .refine((value) => !value.enabled || value.verificationContent.length > 0, {
      message:
        "Google Search Console verification content is required when enabled",
      path: ["verificationContent"],
    }),
  googleAnalytics: z
    .object({
      enabled: z.boolean(),
      measurementId: z.string().trim(),
    })
    .refine((value) => !value.enabled || value.measurementId.length > 0, {
      message: "Google Analytics Measurement ID is required when enabled",
      path: ["measurementId"],
    }),
  umami: z
    .object({
      enabled: z.boolean(),
      scriptUrl: urlOrEmpty,
      websiteId: z.string().trim(),
    })
    .refine((value) => !value.enabled || value.scriptUrl.length > 0, {
      message: "Umami script URL is required when enabled",
      path: ["scriptUrl"],
    })
    .refine((value) => !value.enabled || value.websiteId.length > 0, {
      message: "Umami website ID is required when enabled",
      path: ["websiteId"],
    }),
});

export const siteSettingsSchema = z.object({
  general: generalSchema,
  seo: seoSchema,
  profile: profileSchema,
  social: socialSchema,
  compliance: complianceSchema,
  analytics: analyticsSchema,
});

export const adminSiteSettingsUpdateSchema = siteSettingsSchema.partial();

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
export type AdminSiteSettingsUpdateInput = z.infer<
  typeof adminSiteSettingsUpdateSchema
>;
