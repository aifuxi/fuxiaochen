export const ROLES = {
  admin: "admin",
  visitor: "visitor",
} as const;

export const ROLE_LABEL_MAP = {
  [ROLES.admin]: "管理员",
  [ROLES.visitor]: "游客",
} as const;

export const PERMISSIONS = {
  all: "all",
  // 博客
  blogCreate: "blog:create",
  blogUpdate: "blog:update",
  blogDelete: "blog:delete",
  blogView: "blog:view",

  // 评论
  commentCreate: "comment:create",
  commentUpdate: "comment:update",
  commentDelete: "comment:delete",
  commentView: "comment:view",

  // 标签
  tagCreate: "tag:create",
  tagUpdate: "tag:update",
  tagDelete: "tag:delete",
  tagView: "tag:view",

  // 片段
  snippetCreate: "snippet:create",
  snippetUpdate: "snippet:update",
  snippetDelete: "snippet:delete",
  snippetView: "snippet:view",

  // 分类
  categoryCreate: "category:create",
  categoryUpdate: "category:update",
  categoryDelete: "category:delete",
  categoryView: "category:view",

  // 用户
  userCreate: "user:create",
  userUpdate: "user:update",
  userDelete: "user:delete",
  userView: "user:view",

  // 笔记
  noteCreate: "note:create",
  noteUpdate: "note:update",
  noteDelete: "note:delete",
  noteView: "note:view",
} as const;

export const ROLE_PERMISSIONS = {
  [ROLES.admin]: [PERMISSIONS.all],
  [ROLES.visitor]: [
    PERMISSIONS.blogView,
    PERMISSIONS.tagView,
    PERMISSIONS.snippetView,
    PERMISSIONS.categoryView,
  ],
} as const;
