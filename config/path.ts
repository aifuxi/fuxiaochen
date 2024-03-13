export const PATHS = {
  /** ************* SITE ****************** */
  SITE_HOME: '/',
  SITE_BLOG: '/blog',
  SITE_SNIPPET: '/snippet',

  /** ************* ADMIN ****************** */
  ADMIN_HOME: '/admin',
  ADMIN_STATISTIC: '/admin/statistic',

  ADMIN_BLOG: '/admin/blog',
  ADMIN_BLOG_CREATE: '/admin/blog/create',
  ADMIN_BLOG_EDIT: '/admin/blog/edit',

  ADMIN_SNIPPET: '/admin/snippet',
  ADMIN_SNIPPET_CREATE: '/admin/snippet/create',
  ADMIN_SNIPPET_EDIT: '/admin/snippet/edit',

  ADMIN_TAG: '/admin/tag',

  /** ************* AUTH ****************** */
  AUTH_SIGNIN: '/auth/signin',
  AUTH_SIGNUP: '/auth/signup',
};

export const PATHS_MAP: Record<string, string> = {
  /** ************* SITE ****************** */
  [PATHS.SITE_HOME]: '首页',
  [PATHS.SITE_BLOG]: 'Blog',
  [PATHS.SITE_SNIPPET]: '片段',

  /** ************* ADMIN ****************** */
  [PATHS.ADMIN_HOME]: '首页',
  [PATHS.ADMIN_STATISTIC]: '统计',
  [PATHS.ADMIN_BLOG]: 'Blog',
  [PATHS.ADMIN_BLOG_CREATE]: '创建 Blog',
  [PATHS.ADMIN_BLOG_EDIT]: '编辑 Blog',
  [PATHS.ADMIN_SNIPPET]: '片段',
  [PATHS.ADMIN_SNIPPET_CREATE]: '创建片段',
  [PATHS.ADMIN_SNIPPET_EDIT]: '编辑片段',
  [PATHS.ADMIN_TAG]: '标签',

  /** ************* AUTH ****************** */
  [PATHS.AUTH_SIGNIN]: '登录',
  [PATHS.AUTH_SIGNUP]: '注册',
};
