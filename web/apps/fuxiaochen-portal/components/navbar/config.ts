import { PATHS } from "@/constants";

export const navItems: {
  label?: string;
  link: string;
  external?: boolean;
}[] = [
  {
    label: "博客",
    link: PATHS.BLOGS,
  },
  {
    label: "分类",
    link: PATHS.CATEGORIES,
  },
  {
    label: "标签",
    link: PATHS.TAGS,
  },
  {
    label: "归档",
    link: PATHS.ARCHIVES,
  },
  {
    label: "更新日志",
    link: PATHS.CHANGELOGS,
  },
  {
    label: "关于",
    link: PATHS.ABOUT,
  },
];
