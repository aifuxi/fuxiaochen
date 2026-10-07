import { z } from "zod";

import { httpsUrlSchema, imageUrlSchema, versionSchema, webUrlSchema } from "@/lib/admin/schema";

export const socialIcons = {
  globe: "网站",
  github: "GitHub",
  youtube: "YouTube",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  twitter: "Twitter / X",
  message: "社交 / 聊天",
  rss: "RSS",
  image: "自定义图片",
} as const;
export const socialSchema = z
  .strictObject({
    id: z.uuid(),
    label: z.string().trim().min(1, "请输入展示文案。").max(80),
    url: webUrlSchema,
    icon: z.enum([
      "globe",
      "github",
      "youtube",
      "instagram",
      "linkedin",
      "twitter",
      "message",
      "rss",
      "image",
    ]),
    imageUrl: imageUrlSchema,
    enabled: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.icon === "image" && !value.imageUrl)
      ctx.addIssue({ code: "custom", path: ["imageUrl"], message: "请填写图标图片链接。" });
  });
const optionalHttps = z.union([z.literal(""), httpsUrlSchema]);
const verificationTokenSchema = z
  .string()
  .trim()
  .max(200, "站长验证码最多 200 个字符。")
  .regex(/^[A-Za-z0-9_-]*$/, "只填写验证码，支持字母、数字、下划线和连字符。")
  .default("");
export const settingsSchema = z
  .strictObject({
    title: z.string().trim().min(1, "请输入站点名称。").max(120),
    subtitle: z.string().trim().max(120),
    seoDescription: z.string().trim().max(300, "搜索描述最多 300 个字符。").default(""),
    ogImageUrl: imageUrlSchema.default(""),
    googleVerification: verificationTokenSchema,
    bingVerification: verificationTokenSchema,
    baiduVerification: verificationTokenSchema,
    authorName: z.string().trim().min(1, "请输入博主昵称。").max(120),
    authorRole: z.string().trim().max(120),
    avatarUrl: imageUrlSchema,
    aboutMe: z.string().trim().max(2000),
    postsPerPage: z.number().int().min(1).max(100),
    enableComments: z.boolean(),
    icpText: z.string().trim().max(120),
    icpUrl: optionalHttps,
    policeText: z.string().trim().max(120),
    policeUrl: optionalHttps,
    localAnalyticsEnabled: z.boolean(),
    googleEnabled: z.boolean(),
    googleId: z
      .string()
      .trim()
      .max(32)
      .refine((v) => !v || /^G-[A-Z0-9]+$/.test(v), "请输入 G- 开头的 GA4 Measurement ID。"),
    baiduEnabled: z.boolean(),
    baiduId: z
      .string()
      .trim()
      .max(32)
      .refine((v) => !v || /^[a-fA-F0-9]{32}$/.test(v), "百度站点 ID 须为32位十六进制字符。"),
    socials: z.array(socialSchema).max(20, "最多配置20条社交账号。"),
    version: versionSchema,
  })
  .superRefine((value, ctx) => {
    for (const [text, url] of [
      ["icpText", "icpUrl"],
      ["policeText", "policeUrl"],
    ] as const) {
      if (Boolean(value[text]) !== Boolean(value[url]))
        ctx.addIssue({
          code: "custom",
          path: [value[text] ? url : text],
          message: "备案展示文案与查询链接须一起填写，或一起留空。",
        });
    }
    if (value.googleEnabled && !value.googleId)
      ctx.addIssue({
        code: "custom",
        path: ["googleId"],
        message: "启用 Google 统计前请填写 Measurement ID。",
      });
    if (value.baiduEnabled && !value.baiduId)
      ctx.addIssue({ code: "custom", path: ["baiduId"], message: "启用百度统计前请填写站点 ID。" });
    if (new Set(value.socials.map((v) => v.id)).size !== value.socials.length)
      ctx.addIssue({ code: "custom", path: ["socials"], message: "社交账号 ID 不可重复。" });
  });
export type SocialAccount = z.infer<typeof socialSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type SiteSettings = SettingsInput & {
  updatedAt: string;
  localAnalyticsStartedAt: string | null;
};
export type PublicSettings = Pick<
  SiteSettings,
  | "postsPerPage"
  | "enableComments"
  | "title"
  | "subtitle"
  | "seoDescription"
  | "ogImageUrl"
  | "googleVerification"
  | "bingVerification"
  | "baiduVerification"
  | "authorName"
  | "authorRole"
  | "avatarUrl"
  | "aboutMe"
  | "icpText"
  | "icpUrl"
  | "policeText"
  | "policeUrl"
  | "socials"
  | "localAnalyticsEnabled"
  | "googleEnabled"
  | "googleId"
  | "baiduEnabled"
  | "baiduId"
>;
export const defaultSettings: SettingsInput = {
  title: "付小晨",
  subtitle: "记录生活，分享想法",
  seoDescription: "",
  ogImageUrl: "",
  googleVerification: "",
  bingVerification: "",
  baiduVerification: "",
  authorName: "付小晨",
  authorRole: "开发者 / 设计爱好者",
  avatarUrl: "/avatar.avif",
  aboutMe: "记录生活，分享关于效率工具、创意设计、读书感悟与科技探索的见闻。",
  postsPerPage: 10,
  enableComments: true,
  icpText: "",
  icpUrl: "",
  policeText: "",
  policeUrl: "",
  localAnalyticsEnabled: false,
  googleEnabled: false,
  googleId: "",
  baiduEnabled: false,
  baiduId: "",
  socials: [],
  version: 1,
};
