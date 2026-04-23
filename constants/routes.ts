const ADMIN_ROOT = "/admin";
const BLOG_ROOT = "/blog";

export const routes = {
  site: {
    home: "/",
    about: "/about",
    blog: BLOG_ROOT,
    projects: "/projects",
    friends: "/friends",
    changelog: "/changelog",
    blogPost: (slug: string) => `${BLOG_ROOT}/${encodeURIComponent(slug)}`,
  },
  auth: {
    login: "/login",
    register: "/register",
  },
  admin: {
    root: ADMIN_ROOT,
    posts: `${ADMIN_ROOT}/posts`,
    postsNew: `${ADMIN_ROOT}/posts/new`,
    categories: `${ADMIN_ROOT}/categories`,
    tags: `${ADMIN_ROOT}/tags`,
    changelog: `${ADMIN_ROOT}/changelog`,
    friends: `${ADMIN_ROOT}/friends`,
    comments: `${ADMIN_ROOT}/comments`,
    subscribers: `${ADMIN_ROOT}/subscribers`,
    settings: `${ADMIN_ROOT}/settings`,
  },
} as const;

export const siteNavLinks = [
  { href: routes.site.home, label: "Home" },
  { href: routes.site.blog, label: "Blog" },
  { href: routes.site.projects, label: "Projects" },
  { href: routes.site.friends, label: "Friends" },
  { href: routes.site.about, label: "About" },
  { href: routes.site.changelog, label: "Changelog" },
] as const;
