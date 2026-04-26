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
    postEdit: (slug: string) =>
      `${ADMIN_ROOT}/posts/${encodeURIComponent(slug)}/edit`,
    categories: `${ADMIN_ROOT}/categories`,
    tags: `${ADMIN_ROOT}/tags`,
    changelog: `${ADMIN_ROOT}/changelog`,
    friends: `${ADMIN_ROOT}/friends`,
    comments: `${ADMIN_ROOT}/comments`,
    users: `${ADMIN_ROOT}/users`,
    settings: `${ADMIN_ROOT}/settings`,
  },
} as const;
