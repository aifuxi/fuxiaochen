/**
 * 内部路径常量
 */
export const INTERNAL_PATHS = {
  /** 首页 */
  HOME: "/",

  /** Dashboard - 首页 */
  DASHBOARD: "/dashboard",
  /** Dashboard - 登录页 */
  DASHBOARD_SIGN_IN: "/dashboard/sign-in",
};

/**
 * Dashboard 白名单，无需校验权限
 */
export const DASHBOARD_WHITE_LIST = [INTERNAL_PATHS.DASHBOARD_SIGN_IN];
