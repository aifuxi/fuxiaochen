export type AdminNavigationItem = {
  href: string;
  label: string;
  title: string;
  description: string;
};

export type AdminNavigationGroup = {
  label: string;
  items: readonly AdminNavigationItem[];
};

export type AdminPageContext = {
  section: string;
  title: string;
  description: string;
};

export const adminNavigation = [
  {
    label: "Workspace",
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        title: "Dashboard",
        description:
          "Navigate content resources and monitor the current admin workspace.",
      },
    ],
  },
  {
    label: "Content",
    items: [
      {
        href: "/admin/posts",
        label: "Posts",
        title: "Posts",
        description: "Manage posts, publication state, and taxonomy coverage.",
      },
      {
        href: "/admin/categories",
        label: "Categories",
        title: "Categories",
        description:
          "Maintain the category structure used across published work.",
      },
      {
        href: "/admin/tags",
        label: "Tags",
        title: "Tags",
        description:
          "Organize reusable labels for discovery and editorial flow.",
      },
      {
        href: "/admin/changelog",
        label: "Changelog",
        title: "Changelog",
        description: "Track release notes and update history in one place.",
      },
    ],
  },
] as const satisfies readonly AdminNavigationGroup[];

const defaultContext = {
  section: adminNavigation[0].label,
  title: adminNavigation[0].items[0].title,
  description: adminNavigation[0].items[0].description,
} satisfies AdminPageContext;

function normalizeAdminPathname(pathname: string) {
  if (pathname === "/") {
    return pathname;
  }

  return pathname.replace(/\/+$/, "");
}

export function isAdminNavigationActive(
  pathname: string,
  item: Pick<AdminNavigationItem, "href">,
) {
  const currentPathname = normalizeAdminPathname(pathname);

  if (item.href === "/admin") {
    return currentPathname === item.href;
  }

  return (
    currentPathname === item.href || currentPathname.startsWith(`${item.href}/`)
  );
}

export function getAdminPageContext(pathname: string): AdminPageContext {
  const currentPathname = normalizeAdminPathname(pathname);

  for (const group of adminNavigation) {
    for (const item of group.items) {
      if (isAdminNavigationActive(currentPathname, item)) {
        return {
          section: group.label,
          title: item.title,
          description: item.description,
        };
      }
    }
  }

  return defaultContext;
}
