import type { Metadata } from "next";

export const adminMetadata = {
  root: {
    title: "后台管理",
  },
  dashboard: {
    title: "仪表盘",
  },
  analytics: {
    title: "数据分析",
  },
  posts: {
    title: "文章",
  },
  postsNew: {
    title: "新建文章",
  },
  postEdit: {
    title: "编辑文章",
  },
  projects: {
    title: "项目",
  },
  categories: {
    title: "分类",
  },
  tags: {
    title: "标签",
  },
  changelog: {
    title: "更新日志",
  },
  friends: {
    title: "友链",
  },
  comments: {
    title: "评论",
  },
  users: {
    title: "用户",
  },
  settings: {
    title: "站点设置",
  },
} satisfies Record<string, Metadata>;
