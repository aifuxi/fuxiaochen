export type CmsNavGroup = {
  label: string;
  items: Array<{
    href: string;
    label: string;
    icon: string;
  }>;
};

export type CmsStat = {
  title: string;
  value: string;
  delta: string;
  tone: "success" | "warning" | "info";
};

export type TableColumn<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
};

export type ArticleRow = {
  title: string;
  category: string;
  status: "Published" | "Draft" | "Scheduled";
  author: string;
  updatedAt: string;
};

export type CommentRow = {
  author: string;
  article: string;
  status: "Pending" | "Approved" | "Spam";
  content: string;
};

export type UserRow = {
  name: string;
  role: "Admin" | "Editor" | "Author";
  status: "Active" | "Invited";
  email: string;
};

export const cmsNavGroups: CmsNavGroup[] = [
  {
    label: "Main",
    items: [
      { href: "/cms/dashboard", label: "Dashboard", icon: "layout-dashboard" },
      { href: "/cms/articles", label: "Articles", icon: "file-text" },
      { href: "/cms/projects", label: "Projects", icon: "briefcase-business" },
      { href: "/cms/changelog", label: "Changelog", icon: "history" },
      { href: "/cms/categories", label: "Categories", icon: "folder" },
      { href: "/cms/tags", label: "Tags", icon: "tags" },
      { href: "/cms/comments", label: "Comments", icon: "message-square" },
    ],
  },
  {
    label: "Management",
    items: [
      { href: "/cms/users", label: "Users", icon: "users" },
      { href: "/cms/analytics", label: "Analytics", icon: "bar-chart-3" },
      { href: "/cms/settings", label: "Settings", icon: "settings-2" },
    ],
  },
];

export const cmsStats: CmsStat[] = [
  { title: "Published articles", value: "126", delta: "+8.2%", tone: "success" },
  { title: "Pending reviews", value: "14", delta: "-3.1%", tone: "warning" },
  { title: "Subscriber growth", value: "18.4%", delta: "+2.8%", tone: "info" },
  { title: "Avg. read time", value: "6m 42s", delta: "+0.6%", tone: "success" },
];

export const articleRows: ArticleRow[] = [
  {
    title: "Building a Scalable Design System with CSS Custom Properties",
    category: "Design Systems",
    status: "Published",
    author: "Fuxiaochen",
    updatedAt: "2 hours ago",
  },
  {
    title: "Editorial Motion for Content-Heavy Websites",
    category: "Motion",
    status: "Scheduled",
    author: "Fuxiaochen",
    updatedAt: "Yesterday",
  },
  {
    title: "Model the Content Layer Before the Database",
    category: "Architecture",
    status: "Draft",
    author: "Fuxiaochen",
    updatedAt: "3 days ago",
  },
];

export const commentRows: CommentRow[] = [
  {
    author: "Qin",
    article: "Design System with CSS Custom Properties",
    status: "Pending",
    content: "The token layering section is unusually clear.",
  },
  {
    author: "Mia",
    article: "Editorial Motion for Content-Heavy Websites",
    status: "Approved",
    content: "This helped me remove a lot of noisy transitions.",
  },
];

export const userRows: UserRow[] = [
  {
    name: "Fuxiaochen",
    role: "Admin",
    status: "Active",
    email: "owner@example.com",
  },
  {
    name: "Lin",
    role: "Editor",
    status: "Active",
    email: "lin@example.com",
  },
  {
    name: "Wen",
    role: "Author",
    status: "Invited",
    email: "wen@example.com",
  },
];

export const taxonomyRows = [
  { label: "Design Systems", usage: "18 articles", tone: "primary" },
  { label: "Motion", usage: "9 articles", tone: "warning" },
  { label: "Architecture", usage: "11 articles", tone: "info" },
];

export const activityFeed = [
  "Lin approved the homepage article block refresh.",
  "Three new comments were queued for moderation.",
  "Analytics snapshot refreshed with 7-day retention metrics.",
];
