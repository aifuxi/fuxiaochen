export const ROUTES = {
  Login: {
    href: "/login",
    name: "登录",
  },
  Home: {
    href: "/",
    name: "首页",
  },
  Category: {
    href: "/category",
    name: "分类管理",
  },
  User: {
    href: "/user",
    name: "用户管理",
  },
  Tag: {
    href: "/tag",
    name: "标签管理",
  },
  Blog: {
    href: "/blog",
    name: "博客管理",
  },
  BlogList: {
    href: "/blog/list",
    name: "博客列表",
  },
  BlogCreate: {
    href: "/blog/create",
    name: "创建博客",
  },
  Changelog: {
    href: "/changelog",
    name: "更新日志",
  },
} as const;
