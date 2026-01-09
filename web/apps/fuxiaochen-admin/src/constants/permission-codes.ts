export const PERMISSION_CODES = {
  PermissionAdminAll: "admin:all",

  PermissionUserList: "user:list",
  PermissionUserView: "user:view",
  PermissionUserCreate: "user:create",
  PermissionUserUpdate: "user:update",
  PermissionUserDelete: "user:delete",

  PermissionRoleList: "role:list",
  PermissionRoleView: "role:view",
  PermissionRoleCreate: "role:create",
  PermissionRoleUpdate: "role:update",
  PermissionRoleDelete: "role:delete",

  PermissionTagList: "tag:list",
  PermissionTagView: "tag:view",
  PermissionTagCreate: "tag:create",
  PermissionTagUpdate: "tag:update",
  PermissionTagDelete: "tag:delete",

  PermissionBlogList: "blog:list",
  PermissionBlogView: "blog:view",
  PermissionBlogCreate: "blog:create",
  PermissionBlogUpdate: "blog:update",
  PermissionBlogDelete: "blog:delete",

  PermissionCategoryList: "category:list",
  PermissionCategoryView: "category:view",
  PermissionCategoryCreate: "category:create",
  PermissionCategoryUpdate: "category:update",
  PermissionCategoryDelete: "category:delete",

  PermissionChangelogList: "changelog:list",
  PermissionChangelogView: "changelog:view",
  PermissionChangelogCreate: "changelog:create",
  PermissionChangelogUpdate: "changelog:update",
  PermissionChangelogDelete: "changelog:delete",
} as const;

export type PermissionCode =
  (typeof PERMISSION_CODES)[keyof typeof PERMISSION_CODES];
