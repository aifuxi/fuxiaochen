CREATE TABLE "site_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"general" jsonb NOT NULL,
	"seo" jsonb NOT NULL,
	"profile" jsonb NOT NULL,
	"social" jsonb NOT NULL,
	"compliance" jsonb NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
INSERT INTO "site_settings" ("id", "general", "seo", "profile", "social", "compliance", "updated_at") VALUES (
  'default',
  '{"siteName":"付小晨","siteUrl":"https://fuxiaochen.com","siteDescription":"专注于构建可访问、细节扎实的 Web 产品，持续分享 Web 开发、设计与效率实践。","logoUrl":"/logo.svg","avatarUrl":"/avatar.avif","email":"aifuxi.js@gmail.com"}'::jsonb,
  '{"defaultTitle":"Fuxiaochen - 全栈开发者","defaultDescription":"专注于构建可访问、细节扎实的 Web 产品，持续分享 Web 开发、设计与效率实践。","pages":{"home":{"title":"Fuxiaochen - 全栈开发者","description":"专注于构建可访问、细节扎实的 Web 产品，持续分享 Web 开发、设计与效率实践。"},"about":{"title":"关于 | Fuxiaochen","description":"了解 Fuxiaochen 的经历、技能栈，以及我对产品、工程与创作的长期兴趣。"},"blog":{"title":"博客 | Fuxiaochen","description":"分享关于 Web 开发、设计、工具与工作流的文章与思考。"},"projects":{"title":"项目 | Fuxiaochen","description":"浏览 Fuxiaochen 的项目实践、开源作品与长期积累。"},"friends":{"title":"友链 | Fuxiaochen","description":"这里收录了我关注的朋友，以及他们的博客、作品与主页。"},"changelog":{"title":"更新日志 | Fuxiaochen","description":"查看站点、内容和项目的最新迭代、优化与修复记录。"}}}'::jsonb,
  '{"heroTitle":"Fuxiaochen","heroRole":"全栈开发者","heroSummary":"我专注于构建可访问、细节扎实且易于维护的 Web 体验，持续打磨能真正解决问题的产品与工作流。","heroDescription":"过去几年里，我在不同规模的团队中参与过从前端体验到全栈交付的工作，也会记录 Web 开发、设计与效率实践中的经验。","aboutTitle":"关于我","aboutRole":"全栈开发者","aboutLocation":"San Francisco, CA","bioTitle":"你好","bio":["我是一名全栈开发者，长期关注产品体验、工程效率与长期可维护性，习惯用 React、Next.js 与 TypeScript 构建现代 Web 应用。","进入软件开发领域以来，我参与过创业团队、数字代理机构和企业项目的交付。我重视清晰的架构、稳定的实现，以及真正对用户有帮助的体验设计。","不写代码的时候，我通常会整理技术文章、关注开源社区的新动态，或者继续研究前端工程、设计系统和工作流优化相关的话题。"],"experienceTitle":"经历","experience":[{"role":"高级全栈开发者","company":"科技创业公司","period":"2022 - 至今","description":"负责前端架构和关键功能交付，使用 React、Next.js 与 TypeScript 构建可扩展的 Web 应用。"},{"role":"全栈开发者","company":"数字代理机构","period":"2020 - 2022","description":"为不同行业客户定制 Web 方案，重点关注性能、可访问性与交互体验。"},{"role":"前端开发者","company":"软件公司","period":"2018 - 2020","description":"负责企业级界面开发与设计系统落地，持续提升组件复用与界面一致性。"}],"skillsTitle":"技能","skills":{"languages":["TypeScript","JavaScript","Python","Rust","Go"],"frontend":["React","Next.js","Vue.js","Tailwind CSS","Framer Motion"],"backend":["Node.js","Express","PostgreSQL","Redis","GraphQL"],"tools":["Git","Docker","AWS","Vercel","Figma"]},"beyondCodeTitle":"代码之外","interests":[{"title":"开源","description":"关注并参与能提升开发者效率与体验的开源项目。"},{"title":"写作","description":"通过文章、教程与笔记沉淀经验，分享可复用的方法。"},{"title":"摄影","description":"用影像记录细节，也借此训练对构图与叙事的敏感度。"}],"ctaTitle":"一起做点有意思的事","ctaDescription":"如果你正在推进新的项目、内容或产品，也欢迎来聊合作、创意和实现方案。"}'::jsonb,
  '{"githubUrl":"https://github.com/aifuxi","twitterUrl":"https://twitter.com","linkedinUrl":"https://linkedin.com","juejinUrl":"https://juejin.cn/user/2647279733052494","bilibiliUrl":"https://space.bilibili.com/315542317","sourceCodeUrl":"https://github.com/aifuxi/fuxiaochen"}'::jsonb,
  '{"icpNumber":"赣 ICP 备 2024026230 号","icpLink":"https://beian.miit.gov.cn","policeNumber":"赣公网安备 36100002000386 号","policeLink":"http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=36100002000386"}'::jsonb,
  now()
) ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
DROP INDEX "user_role_idx";--> statement-breakpoint
CREATE INDEX "user_role_idx" ON "user" USING btree ("role");
