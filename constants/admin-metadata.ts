import type { Metadata } from "next";

const ADMIN_TITLE_SUFFIX = "Fuxiaochen Admin";

function buildAdminTitle(pageTitle?: string) {
  return pageTitle
    ? `${pageTitle} | ${ADMIN_TITLE_SUFFIX}`
    : ADMIN_TITLE_SUFFIX;
}

export const adminMetadata = {
  root: {
    title: buildAdminTitle(),
  },
  dashboard: {
    title: buildAdminTitle("仪表盘"),
  },
  analytics: {
    title: buildAdminTitle("数据分析"),
  },
  posts: {
    title: buildAdminTitle("文章"),
  },
  postsNew: {
    title: buildAdminTitle("新建文章"),
  },
  postEdit: {
    title: buildAdminTitle("编辑文章"),
  },
  projects: {
    title: buildAdminTitle("项目"),
  },
  categories: {
    title: buildAdminTitle("分类"),
  },
  tags: {
    title: buildAdminTitle("标签"),
  },
  changelog: {
    title: buildAdminTitle("更新日志"),
  },
  friends: {
    title: buildAdminTitle("友链"),
  },
  comments: {
    title: buildAdminTitle("评论"),
  },
  users: {
    title: buildAdminTitle("用户"),
  },
  settings: {
    title: buildAdminTitle("站点设置"),
  },
} satisfies Record<string, Metadata>;
