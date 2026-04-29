import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

import type { PublicBlogListQuery } from "@/lib/server/blogs/dto";
import { toPublicBlog, type PublicBlog } from "@/lib/server/blogs/mappers";
import { blogService } from "@/lib/server/blogs/service";
import { blogStatsService, DEFAULT_BLOG_STATS } from "@/lib/server/blogs/stats";
import {
  toPublicCategory,
  type PublicCategory,
} from "@/lib/server/categories/mappers";
import { categoryService } from "@/lib/server/categories/service";
import {
  toPublicChangelog,
  type PublicChangelog,
} from "@/lib/server/changelogs/mappers";
import { changelogService } from "@/lib/server/changelogs/service";
import {
  toPublicFriend,
  type PublicFriend,
} from "@/lib/server/friends/mappers";
import { friendService } from "@/lib/server/friends/service";
import type { PublicProjectListQuery } from "@/lib/server/projects/dto";
import {
  toPublicProject,
  type PublicProject,
} from "@/lib/server/projects/mappers";
import { projectService } from "@/lib/server/projects/service";
import { toPublicTag, type PublicTag } from "@/lib/server/tags/mappers";
import { tagService } from "@/lib/server/tags/service";

export const PUBLIC_CONTENT_CACHE_TAGS = {
  blogs: "public-blogs",
  categories: "public-categories",
  tags: "public-tags",
  projects: "public-projects",
  friends: "public-friends",
  changelogs: "public-changelogs",
} as const;

type PublicBlogListPayload = {
  items: PublicBlog[];
};

type PublicProjectListPayload = {
  items: PublicProject[];
};

type PublicFriendListPayload = {
  items: PublicFriend[];
};

type PublicChangelogListPayload = {
  items: PublicChangelog[];
};

type PublicBlogPageData = PublicBlogListPayload & {
  categories: PublicCategory[];
  tags: PublicTag[];
};

const publicBlogListQuery = {
  page: 1,
  pageSize: 100,
  sortBy: "date",
  sortDirection: "desc",
} satisfies PublicBlogListQuery;

const featuredBlogListQuery = {
  page: 1,
  pageSize: 3,
  featured: true,
  sortBy: "date",
  sortDirection: "desc",
} satisfies PublicBlogListQuery;

const recentBlogListQuery = {
  page: 1,
  pageSize: 5,
  featured: false,
  sortBy: "date",
  sortDirection: "desc",
} satisfies PublicBlogListQuery;

const publicProjectListQuery = {
  page: 1,
  pageSize: 100,
  sortBy: "year",
  sortDirection: "desc",
} satisfies PublicProjectListQuery;

const changelogListQuery = {
  page: 1,
  pageSize: 100,
  sortBy: "releaseDate",
  sortDirection: "desc",
} as const;

const toPublicBlogsWithStats = async (
  blogs: Awaited<ReturnType<typeof blogService.listPublicBlogs>>["items"],
) => {
  const statsByBlogId = await blogStatsService
    .getStatsByBlogIds(blogs.map((blog) => blog.id))
    .catch(() => new Map());

  return blogs.map((blog) =>
    toPublicBlog(blog, statsByBlogId.get(blog.id) ?? DEFAULT_BLOG_STATS),
  );
};

const getCachedPublicBlogs = unstable_cache(
  async (): Promise<PublicBlogListPayload> => {
    const result = await blogService.listPublicBlogs(publicBlogListQuery);

    return {
      items: await toPublicBlogsWithStats(result.items),
    };
  },
  ["public-blogs-list"],
  {
    tags: [PUBLIC_CONTENT_CACHE_TAGS.blogs],
  },
);

export const getCachedFeaturedBlogs = unstable_cache(
  async (): Promise<PublicBlogListPayload> => {
    const result = await blogService.listPublicBlogs(featuredBlogListQuery);

    return {
      items: await toPublicBlogsWithStats(result.items),
    };
  },
  ["public-featured-blogs"],
  {
    tags: [PUBLIC_CONTENT_CACHE_TAGS.blogs],
  },
);

export const getCachedRecentBlogs = unstable_cache(
  async (): Promise<PublicBlogListPayload> => {
    const result = await blogService.listPublicBlogs(recentBlogListQuery);

    return {
      items: await toPublicBlogsWithStats(result.items),
    };
  },
  ["public-recent-blogs"],
  {
    tags: [PUBLIC_CONTENT_CACHE_TAGS.blogs],
  },
);

const getCachedPublicCategories = unstable_cache(
  async (): Promise<PublicCategory[]> => {
    const categories = await categoryService.listPublicCategories();

    return categories.map(toPublicCategory);
  },
  ["public-categories-list"],
  {
    tags: [PUBLIC_CONTENT_CACHE_TAGS.categories],
  },
);

const getCachedPublicTags = unstable_cache(
  async (): Promise<PublicTag[]> => {
    const tags = await tagService.listPublicTags();

    return tags.map(toPublicTag);
  },
  ["public-tags-list"],
  {
    tags: [PUBLIC_CONTENT_CACHE_TAGS.tags],
  },
);

export const getCachedPublicBlogPageData = unstable_cache(
  async (): Promise<PublicBlogPageData> => {
    const [blogs, categories, tags] = await Promise.all([
      getCachedPublicBlogs(),
      getCachedPublicCategories(),
      getCachedPublicTags(),
    ]);

    return {
      items: blogs.items,
      categories,
      tags,
    };
  },
  ["public-blog-page-data"],
  {
    tags: [
      PUBLIC_CONTENT_CACHE_TAGS.blogs,
      PUBLIC_CONTENT_CACHE_TAGS.categories,
      PUBLIC_CONTENT_CACHE_TAGS.tags,
    ],
  },
);

export const getCachedPublicProjects = unstable_cache(
  async (): Promise<PublicProjectListPayload> => {
    const result = await projectService.listPublicProjects(
      publicProjectListQuery,
    );

    return {
      items: result.items.map(toPublicProject),
    };
  },
  ["public-projects-list"],
  {
    tags: [PUBLIC_CONTENT_CACHE_TAGS.projects],
  },
);

export const getCachedPublicFriends = unstable_cache(
  async (): Promise<PublicFriendListPayload> => {
    const friends = await friendService.listPublicFriends();

    return {
      items: friends.map(toPublicFriend),
    };
  },
  ["public-friends-list"],
  {
    tags: [PUBLIC_CONTENT_CACHE_TAGS.friends],
  },
);

export const getCachedPublicChangelogs = unstable_cache(
  async (): Promise<PublicChangelogListPayload> => {
    const result = await changelogService.listChangelogs(changelogListQuery);

    return {
      items: result.items.map(toPublicChangelog),
    };
  },
  ["public-changelogs-list"],
  {
    tags: [PUBLIC_CONTENT_CACHE_TAGS.changelogs],
  },
);

export const revalidatePublicBlogContent = () => {
  revalidateTag(PUBLIC_CONTENT_CACHE_TAGS.blogs, "max");
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/server-sitemap.xml");
};

export const revalidatePublicCategoryContent = () => {
  revalidateTag(PUBLIC_CONTENT_CACHE_TAGS.categories, "max");
  revalidateTag(PUBLIC_CONTENT_CACHE_TAGS.blogs, "max");
  revalidatePath("/");
  revalidatePath("/blog");
};

export const revalidatePublicTagContent = () => {
  revalidateTag(PUBLIC_CONTENT_CACHE_TAGS.tags, "max");
  revalidateTag(PUBLIC_CONTENT_CACHE_TAGS.blogs, "max");
  revalidatePath("/");
  revalidatePath("/blog");
};

export const revalidatePublicProjectContent = () => {
  revalidateTag(PUBLIC_CONTENT_CACHE_TAGS.projects, "max");
  revalidatePath("/projects");
};

export const revalidatePublicFriendContent = () => {
  revalidateTag(PUBLIC_CONTENT_CACHE_TAGS.friends, "max");
  revalidatePath("/friends");
};

export const revalidatePublicChangelogContent = () => {
  revalidateTag(PUBLIC_CONTENT_CACHE_TAGS.changelogs, "max");
  revalidatePath("/changelog");
};
