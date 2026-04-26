export type SiteSeoPageKey =
  | "home"
  | "about"
  | "blog"
  | "projects"
  | "friends"
  | "changelog";

export type SiteSeoPage = {
  title: string;
  description: string;
};

export type SiteSettingsGeneral = {
  siteName: string;
  siteUrl: string;
  siteDescription: string;
  logoUrl: string;
  avatarUrl: string;
  email: string;
};

export type SiteSettingsSeo = {
  defaultTitle: string;
  defaultDescription: string;
  pages: Record<SiteSeoPageKey, SiteSeoPage>;
};

export type SiteSettingsExperience = {
  role: string;
  company: string;
  period: string;
  description: string;
};

export type SiteSettingsInterest = {
  title: string;
  description: string;
};

export type SiteSettingsSkills = {
  languages: string[];
  frontend: string[];
  backend: string[];
  tools: string[];
};

export type SiteSettingsProfile = {
  heroTitle: string;
  heroRole: string;
  heroSummary: string;
  heroDescription: string;
  aboutTitle: string;
  aboutRole: string;
  aboutLocation: string;
  bioTitle: string;
  bio: string[];
  experienceTitle: string;
  experience: SiteSettingsExperience[];
  skillsTitle: string;
  skills: SiteSettingsSkills;
  beyondCodeTitle: string;
  interests: SiteSettingsInterest[];
  ctaTitle: string;
  ctaDescription: string;
};

export type SiteSettingsSocial = {
  githubUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  juejinUrl: string;
  bilibiliUrl: string;
  sourceCodeUrl: string;
};

export type SiteSettingsCompliance = {
  icpNumber: string;
  icpLink: string;
  policeNumber: string;
  policeLink: string;
};

export type SiteSettings = {
  general: SiteSettingsGeneral;
  seo: SiteSettingsSeo;
  profile: SiteSettingsProfile;
  social: SiteSettingsSocial;
  compliance: SiteSettingsCompliance;
};
