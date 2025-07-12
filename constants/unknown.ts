/** 空数据文案 */
export const PLACEHOLDER_TEXT = "N/A";

export const ADMIN_EMAILS = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",");

interface NavItem {
  link: string;
  label: string;
}

export const navItems: NavItem[] = [
  { label: "首页", link: "/" },
  { label: "博客", link: "/blog" },
  { label: "片段", link: "/snippet" },
  { label: "关于", link: "/about" },
];
