export const siteNavItems = [
  { href: "/", label: "Home" },
  { href: "/articles", label: "Articles" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
] as const;

export const siteMoreNavItems = [
  { href: "/changelog", label: "Changelog" },
  { href: "/friends", label: "Friends" },
  { href: "/design-spec", label: "Design Spec" },
] as const;

export const featuredArticles = [
  {
    href: "/articles/design-tokens-at-scale",
    category: "Design Systems",
    title: "Building a Scalable Design System with CSS Custom Properties",
    excerpt:
      "从 token、语义层到组件变体，建立一个可随产品迭代持续演进的视觉语言。",
    date: "Dec 15, 2024",
    readTime: "8 min read",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&h=720&fit=crop",
  },
  {
    href: "/articles/editorial-interfaces",
    category: "Editorial UI",
    title: "Designing Editorial Interfaces for Focus and Atmosphere",
    excerpt:
      "在深色内容产品里平衡阅读密度、视觉呼吸感和操作反馈。",
    date: "Nov 28, 2024",
    readTime: "6 min read",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&h=720&fit=crop",
  },
  {
    href: "/articles/cms-operations",
    category: "CMS",
    title: "Operational Dashboards That Stay Calm Under Load",
    excerpt:
      "把高信息密度后台做得更克制、更稳定，而不是更吵。",
    date: "Nov 08, 2024",
    readTime: "7 min read",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&h=720&fit=crop",
  },
] as const;

export const latestWritings = [
  {
    href: "/articles/variant-driven-cms-ui",
    category: "Variants",
    title: "Variant-Driven CMS UI Without Boolean Prop Sprawl",
    excerpt: "把 base, variant, size, state, slot 的层次真正落进代码结构。",
    date: "Oct 22, 2024",
    readTime: "5 min read",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=320&fit=crop",
  },
  {
    href: "/articles/route-groups",
    category: "Next.js",
    title: "Route Groups for Splitting Public Site and CMS",
    excerpt: "让站点、后台、认证壳层清晰分治，不让布局逻辑互相污染。",
    date: "Oct 09, 2024",
    readTime: "4 min read",
    image:
      "https://images.unsplash.com/photo-1516321165247-4aa89a48be28?w=400&h=320&fit=crop",
  },
  {
    href: "/articles/content-tempo",
    category: "Writing",
    title: "Shaping Content Tempo with Typography and Motion",
    excerpt: "动效不是点缀，它是阅读节奏的一部分。",
    date: "Sep 19, 2024",
    readTime: "6 min read",
    image:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=320&fit=crop",
  },
] as const;

export const archiveArticles = [
  ...featuredArticles,
  ...latestWritings,
  {
    href: "/articles/foundations",
    category: "Typography",
    title: "Newsreader, Inter and Space Grotesk as a System",
    excerpt: "三种字族如何在同一产品里建立稳定而鲜明的角色分工。",
    date: "Aug 28, 2024",
    readTime: "6 min read",
    image:
      "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=900&h=720&fit=crop",
  },
  {
    href: "/articles/semantic-color",
    category: "Tokens",
    title: "Semantic Color Tokens for Dark Editorial Products",
    excerpt: "从背景层级、边框到弱文本，建立真正可维护的深色 token。",
    date: "Aug 02, 2024",
    readTime: "5 min read",
    image:
      "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=900&h=720&fit=crop",
  },
] as const;

export const filterTags = [
  "All",
  "Design Systems",
  "Editorial UI",
  "CMS",
  "Next.js",
  "Typography",
] as const;

export const projects = [
  {
    title: "Chen Serif Site",
    description:
      "把个人主页、文章归档、长文详情和设计文档统一到一套深色 editorial 系统。",
    tags: ["Next.js", "Tailwind v4", "App Router"],
    links: ["Case Study", "Live Preview"],
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&h=720&fit=crop",
  },
  {
    title: "SuperBlog CMS",
    description:
      "高密度内容运营后台，覆盖统计、筛选、表格、评论审核和设置配置。",
    tags: ["Prisma", "Better Auth", "Radix"],
    links: ["Dashboard", "Components"],
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&h=720&fit=crop",
  },
  {
    title: "Design Token Atlas",
    description:
      "将 token、排版、组件和动效规范落为一页可浏览、可演示的系统文档。",
    tags: ["Design System", "Docs", "Tokens"],
    links: ["Spec", "Libraries"],
    image:
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=900&h=720&fit=crop",
  },
  {
    title: "Quiet Analytics",
    description:
      "以克制的层级和柔和强调色展示趋势、来源、表现最好的内容和转化表现。",
    tags: ["Analytics", "Charts", "Operations"],
    links: ["Overview", "Report"],
    image:
      "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=900&h=720&fit=crop",
  },
] as const;

export const friends = [
  {
    name: "Aiko Tan",
    title: "Product Designer",
    note: "专注系统化交互与内容导向界面。",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
  },
  {
    name: "Ming Zhao",
    title: "Platform Engineer",
    note: "把复杂基础设施讲清楚，也做得足够稳。",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
  },
  {
    name: "Sora Lin",
    title: "Content Strategist",
    note: "擅长内容架构、知识库与长期文档维护。",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
  },
  {
    name: "Riku Mori",
    title: "Frontend Engineer",
    note: "对前端性能、动画时序和组件边界非常敏感。",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face",
  },
  {
    name: "Yuna Park",
    title: "Researcher",
    note: "喜欢把抽象的研究结果变成可执行设计原则。",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face",
  },
  {
    name: "Kei Watanabe",
    title: "Writer",
    note: "长期写作软件设计、协作流程与创造性工作。",
    avatar:
      "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=200&h=200&fit=crop&crop=face",
  },
] as const;

export const releases = [
  {
    version: "v1.4.0",
    date: "2025.01.08",
    summary: "Refined editorial page rhythm and extracted shared hero, card and footer patterns.",
    changes: [
      { type: "added", text: "新的 article detail 目录结构与目录导航。" },
      { type: "improved", text: "站点导航滚动压缩和背景模糊层次。" },
      { type: "changed", text: "项目卡片改为图像 + tags + links 结构。" },
    ],
  },
  {
    version: "v1.3.0",
    date: "2024.12.02",
    summary: "Brought CMS operations pages into the same token language as the public site.",
    changes: [
      { type: "added", text: "评论审核、分类、标签和用户管理页面。" },
      { type: "improved", text: "后台表格 hover、badge、toolbar 和筛选器样式。" },
      { type: "bugfix", text: "修复移动端 sidebar 遮罩和 header 对齐问题。" },
    ],
  },
  {
    version: "v1.2.0",
    date: "2024.10.18",
    summary: "Introduced the design system documentation route and token showcase.",
    changes: [
      { type: "added", text: "色彩、字体、组件、表格、分页、动效规范文档。" },
      { type: "removed", text: "旧的零散样式示例页。" },
    ],
  },
] as const;

export const dashboardStats = [
  { label: "Published", value: "128", detail: "+12.4% this month" },
  { label: "Drafts", value: "19", detail: "5 waiting review" },
  { label: "Comments", value: "342", detail: "28 pending moderation" },
  { label: "Views", value: "42.8k", detail: "rolling 30 days" },
] as const;

export const analyticsStats = [
  { label: "Visitors", value: "18.4k", detail: "+8.1%" },
  { label: "Read Rate", value: "67%", detail: "+3.2%" },
  { label: "Avg Read", value: "6m 12s", detail: "+0.8m" },
  { label: "CTR", value: "4.8%", detail: "+0.6%" },
  { label: "Bounce", value: "31%", detail: "-2.1%" },
] as const;

export const cmsArticles = [
  {
    title: "Building a Scalable Design System with CSS Custom Properties",
    category: "Design Systems",
    author: "Alex Chen",
    status: "published",
    date: "2024-12-15",
    views: "2,847",
  },
  {
    title: "Designing Editorial Interfaces for Focus and Atmosphere",
    category: "Editorial UI",
    author: "Alex Chen",
    status: "draft",
    date: "2024-11-28",
    views: "1,932",
  },
  {
    title: "Operational Dashboards That Stay Calm Under Load",
    category: "CMS",
    author: "Sarah Chen",
    status: "archived",
    date: "2024-11-08",
    views: "1,204",
  },
] as const;

export const taxonomyRows = [
  { name: "Design Systems", count: 18, updated: "2 days ago", tone: "primary" },
  { name: "Editorial UI", count: 11, updated: "5 days ago", tone: "info" },
  { name: "Architecture", count: 9, updated: "1 week ago", tone: "warning" },
  { name: "Writing", count: 6, updated: "2 weeks ago", tone: "default" },
] as const;

export const tagRows = [
  { name: "tokens", count: 24, updated: "today", tone: "primary" },
  { name: "nextjs", count: 17, updated: "today", tone: "info" },
  { name: "cms", count: 13, updated: "3 days ago", tone: "warning" },
  { name: "typography", count: 8, updated: "5 days ago", tone: "default" },
] as const;

export const comments = [
  {
    author: "Nora Kim",
    email: "nora@example.com",
    article: "Building a Scalable Design System with CSS Custom Properties",
    content: "把 token 层和组件变体层拆开的解释非常清楚，尤其是 tone 和 variant 的边界。",
    status: "approved",
    time: "12 minutes ago",
  },
  {
    author: "David Wu",
    email: "david@example.com",
    article: "Operational Dashboards That Stay Calm Under Load",
    content: "后台这套层级很克制，想知道图表组件后续会不会继续沿用同样的弱强调风格。",
    status: "pending",
    time: "1 hour ago",
  },
  {
    author: "Spam Bot",
    email: "promo@example.com",
    article: "Designing Editorial Interfaces for Focus and Atmosphere",
    content: "Visit our page for cheap traffic and ads.",
    status: "spam",
    time: "3 hours ago",
  },
] as const;

export const users = [
  {
    name: "Sarah Chen",
    email: "sarah@superblog.dev",
    role: "Admin",
    status: "Active",
    joined: "Jan 12, 2024",
  },
  {
    name: "Alex Chen",
    email: "alex@superblog.dev",
    role: "Author",
    status: "Active",
    joined: "Feb 03, 2024",
  },
  {
    name: "Mina Lee",
    email: "mina@superblog.dev",
    role: "Reader",
    status: "Inactive",
    joined: "Oct 14, 2024",
  },
] as const;

export const trafficBars = [
  { label: "Mon", value: 62 },
  { label: "Tue", value: 78 },
  { label: "Wed", value: 56 },
  { label: "Thu", value: 92 },
  { label: "Fri", value: 74 },
  { label: "Sat", value: 44 },
  { label: "Sun", value: 68 },
] as const;

export const popularArticles = [
  { title: "Building a Scalable Design System with CSS Custom Properties", views: "2,847" },
  { title: "Designing Editorial Interfaces for Focus and Atmosphere", views: "1,932" },
  { title: "Route Groups for Splitting Public Site and CMS", views: "1,284" },
] as const;

export const settingsSections = [
  { id: "general", label: "General" },
  { id: "seo", label: "SEO" },
  { id: "appearance", label: "Appearance" },
  { id: "notifications", label: "Notifications" },
] as const;
