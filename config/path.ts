export const PATHS = {
  /** ************* SITE ****************** */
  SITE_HOME: '/',
  SITE_ARTICLES: '/articles',

  /** ************* ADMIN ****************** */
  ADMIN_HOME: '/admin',
  ADMIN_ARTICLE: '/admin/article',
  ADMIN_ARTICLE_CREATE: '/admin/article/create',
  ADMIN_ARTICLE_EDIT: '/admin/article/edit',
  ADMIN_TAG: '/admin/tag',

  /** ************* AUTH ****************** */
  AUTH_SIGNIN: '/auth/signin',
  AUTH_SIGNUP: '/auth/signup',
};

export const PATHS_MAP = {
  /** ************* SITE ****************** */
  [PATHS.SITE_HOME]: '首页',
  [PATHS.SITE_ARTICLES]: '文章',

  /** ************* ADMIN ****************** */
  [PATHS.ADMIN_HOME]: '/admin',
  [PATHS.ADMIN_ARTICLE]: '文章管理',
  [PATHS.ADMIN_ARTICLE_CREATE]: '创建文章',
  [PATHS.ADMIN_ARTICLE_EDIT]: '编辑文章',
  [PATHS.ADMIN_TAG]: '标签管理',

  /** ************* AUTH ****************** */
  [PATHS.AUTH_SIGNIN]: '登录',
  [PATHS.AUTH_SIGNUP]: '注册',
};
