import type { SiteSettings } from "@/lib/settings/types";

import {
  BEI_AN_LINK,
  BEI_AN_NUMBER,
  BILIBILI_PAGE,
  EMAIL,
  GITHUB_PAGE,
  GONG_AN_LINK,
  GONG_AN_NUMBER,
  JUEJIN_PAGE,
  SOURCE_CODE_GITHUB_PAGE,
  WEBSITE,
} from "@/constants/info";
import { siteCopy } from "@/constants/site-copy";

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  general: {
    siteName: WEBSITE,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://fuxiaochen.com",
    siteDescription: siteCopy.metadata.root.description,
    logoUrl: "/logo.svg",
    avatarUrl: "/avatar.avif",
    email: EMAIL,
  },
  seo: {
    defaultTitle: siteCopy.metadata.root.title,
    defaultDescription: siteCopy.metadata.root.description,
    pages: {
      home: siteCopy.metadata.root,
      about: siteCopy.metadata.about,
      blog: siteCopy.metadata.blog,
      projects: siteCopy.metadata.projects,
      friends: siteCopy.metadata.friends,
      changelog: siteCopy.metadata.changelog,
    },
  },
  profile: {
    heroTitle: "Fuxiaochen",
    heroRole: siteCopy.hero.role,
    heroSummary: siteCopy.hero.summary,
    heroDescription: siteCopy.hero.description,
    aboutTitle: siteCopy.about.title,
    aboutRole: siteCopy.about.role,
    aboutLocation: siteCopy.about.location,
    bioTitle: siteCopy.about.bioTitle,
    bio: [...siteCopy.about.bio],
    experienceTitle: siteCopy.about.experienceTitle,
    experience: siteCopy.about.experience.map((item) => ({ ...item })),
    skillsTitle: siteCopy.about.skillsTitle,
    skills: {
      languages: ["TypeScript", "JavaScript", "Python", "Rust", "Go"],
      frontend: ["React", "Next.js", "Vue.js", "Tailwind CSS", "Framer Motion"],
      backend: ["Node.js", "Express", "PostgreSQL", "Redis", "GraphQL"],
      tools: ["Git", "Docker", "AWS", "Vercel", "Figma"],
    },
    beyondCodeTitle: siteCopy.about.beyondCodeTitle,
    interests: siteCopy.about.interests.map((item) => ({ ...item })),
    ctaTitle: siteCopy.about.ctaTitle,
    ctaDescription: siteCopy.about.ctaDescription,
  },
  social: {
    githubUrl: GITHUB_PAGE,
    twitterUrl: "https://twitter.com",
    linkedinUrl: "https://linkedin.com",
    juejinUrl: JUEJIN_PAGE,
    bilibiliUrl: BILIBILI_PAGE,
    sourceCodeUrl: SOURCE_CODE_GITHUB_PAGE,
  },
  compliance: {
    icpNumber: BEI_AN_NUMBER,
    icpLink: BEI_AN_LINK,
    policeNumber: GONG_AN_NUMBER,
    policeLink: GONG_AN_LINK,
  },
  analytics: {
    googleSearchConsole: {
      enabled: false,
      verificationContent: "",
    },
    googleAnalytics: {
      enabled: false,
      measurementId: "",
    },
    umami: {
      enabled: false,
      scriptUrl: "",
      websiteId: "",
    },
  },
};
