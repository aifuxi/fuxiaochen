import { NICKNAME } from ".";

export const PATHS = {
  /** ************* SITE ****************** */
  HOME: "/",
  BLOG: "/blog",
  SNIPPET: "/snippet",
  ABOUT: "/about",
  SITEMAP: "/sitemap.xml",

  /** ************* DASHBOARD ****************** */
  DASHBOARD: "/dashboard",
  DASHBOARD_STATISTIC: "/dashboard/statistic",

  DASHBOARD_BLOG: "/dashboard/blog",
  DASHBOARD_BLOG_CREATE: "/dashboard/blog/create",
  DASHBOARD_BLOG_EDIT: "/dashboard/blog/edit",

  DASHBOARD_SNIPPET: "/dashboard/snippet",
  DASHBOARD_SNIPPET_CREATE: "/dashboard/snippet/create",
  DASHBOARD_SNIPPET_EDIT: "/dashboard/snippet/edit",

  DASHBOARD_TAG: "/dashboard/tag",
  DASHBOARD_NOTE: "/dashboard/note",

  /** ************* AUTH ****************** */
  AUTH_LOGIN: "/auth/login",
  AUTH_REGISTER: "/auth/register",
};

export const PATHS_MAP: Record<string, string> = {
  /** ************* SITE ****************** */
  [PATHS.HOME]: "首页",
  [PATHS.BLOG]: "博客",
  [PATHS.SNIPPET]: "片段",
  [PATHS.ABOUT]: "关于",
  [PATHS.SITEMAP]: "站点地图",

  /** ************* DASHBOARD ****************** */
  [PATHS.DASHBOARD]: "首页",
  [PATHS.DASHBOARD_STATISTIC]: "统计",
  [PATHS.DASHBOARD_BLOG]: "博客",
  [PATHS.DASHBOARD_BLOG_CREATE]: "创建博客",
  [PATHS.DASHBOARD_BLOG_EDIT]: "编辑博客",
  [PATHS.DASHBOARD_SNIPPET]: "片段",
  [PATHS.DASHBOARD_SNIPPET_CREATE]: "创建片段",
  [PATHS.DASHBOARD_SNIPPET_EDIT]: "编辑片段",
  [PATHS.DASHBOARD_TAG]: "标签",
  [PATHS.DASHBOARD_NOTE]: "笔记",

  /** ************* AUTH ****************** */
  [PATHS.AUTH_LOGIN]: "登录",
  [PATHS.AUTH_REGISTER]: "注册",
};

export const PATH_DESCRIPTION_MAP: Record<string, string> = {
  /** ************* SITE ****************** */
  [PATHS.HOME]: "首页",
  [PATHS.BLOG]: "这里记录了我的想法、文章，希望和大家一起交流～",
  [PATHS.SNIPPET]: "多是一些零零碎碎的片段，通常是代码片段",
  [PATHS.ABOUT]: `叮～ 你有一份关于${NICKNAME}的简介，请查收～`,

  /** ************* DASHBOARD ****************** */
  [PATHS.DASHBOARD]: "欢迎回来，要努力学习嗷～",
  [PATHS.DASHBOARD_STATISTIC]: "聚合本站的所有统计数据",
  [PATHS.DASHBOARD_BLOG]: `博客管理，在这里对 博客进行 增、删、改、查操作`,
  [PATHS.DASHBOARD_BLOG_CREATE]: "在这里尽情地创作吧！",
  [PATHS.DASHBOARD_BLOG_EDIT]:
    "世界破破烂烂，博客修修补补，好的文章总是需要反复打磨的",
  [PATHS.DASHBOARD_SNIPPET]: `片段管理，在这里对片段进行 增、删、改、查操作`,
  [PATHS.DASHBOARD_SNIPPET_CREATE]:
    "Talk is cheap. Show me the code. From Linus Torvalds",
  [PATHS.DASHBOARD_SNIPPET_EDIT]: "修修补补，总比没有好",
  [PATHS.DASHBOARD_TAG]: `标签管理，在这里对标签进行 增、删、改、查操作`,
  [PATHS.DASHBOARD_NOTE]: "好记性不如烂笔头，灵感一闪",

  /** ************* AUTH ****************** */
  [PATHS.AUTH_LOGIN]: "登录",
  [PATHS.AUTH_REGISTER]: "注册",
};
