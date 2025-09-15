import { type LucideIcon, Scroll, User } from "lucide-react";
import { Book, CodeXml, Home, Tags } from "lucide-react";

import { PATHS } from "@/constants";

export interface NavItem {
  title?: string;
  itemKey: string;
  href?: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: NavItem[];
}

export const sidebarItems: NavItem[] = [
  {
    title: "首页",
    href: PATHS.ADMIN_HOME,
    icon: Home,
    itemKey: "home",
  },
  {
    title: "博客",
    icon: Book,
    itemKey: "blog",
    items: [
      {
        itemKey: "blogList",
        title: "列表",
        href: PATHS.ADMIN_BLOG,
      },
      {
        itemKey: "blogCreate",
        title: "创建",
        href: PATHS.ADMIN_BLOG_CREATE,
      },
      // {
      //   itemKey: "blogEdit",
      //   title: "编辑",
      //   href: PATHS.ADMIN_BLOG_EDIT,
      // },
    ],
  },
  {
    title: "代码片段",
    icon: CodeXml,
    itemKey: "snippet",
    items: [
      {
        itemKey: "snippetList",
        title: "列表",
        href: PATHS.ADMIN_SNIPPET,
      },
      {
        itemKey: "snippetCreate",
        title: "创建",
        href: PATHS.ADMIN_SNIPPET_CREATE,
      },
      // {
      //   itemKey: "snippetEdit",
      //   title: "编辑",
      //   href: PATHS.ADMIN_SNIPPET_EDIT,
      // },
    ],
  },
  {
    title: "标签",
    href: PATHS.ADMIN_TAG,
    icon: Tags,
    itemKey: "tag",
  },
  {
    title: "笔记",
    href: PATHS.ADMIN_NOTE,
    icon: Scroll,
    itemKey: "note",
  },
  {
    title: "用户",
    href: PATHS.ADMIN_USER,
    icon: User,
    itemKey: "user",
  },
];

export const flattenedSidebarItems = sidebarItems.reduce((acc, item) => {
  if (item.items) {
    acc.push(...item.items);
  } else {
    acc.push(item);
  }
  return acc;
}, [] as NavItem[]);
