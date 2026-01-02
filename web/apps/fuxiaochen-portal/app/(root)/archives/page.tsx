import Link from "next/link";

import { Book02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { type Blog, getBlogList } from "@/api/blog";
import { PATHS } from "@/constants";
import { formattedDate, toYYYYMMDD } from "@/lib/common";

export const revalidate = 60;

export default async function Page() {
  const resp = await getBlogList({
    page: 1,
    pageSize: 10000,
  });

  const { lists = [], total = 0 } = resp.data;

  // 根据博客的创建年份分组，年份从到大小排序，年份中月份也从到大小排序
  const groupedBlogs = lists.reduce((acc, blog) => {
    const year = new Date(blog.createdAt).getFullYear();
    const month = new Date(blog.createdAt).getMonth() + 1;
    if (!acc.has(year)) {
      acc.set(year, new Map<number, Blog[]>());
    }
    if (!acc.get(year)!.has(month)) {
      acc.get(year)!.set(month, []);
    }
    acc.get(year)!.get(month)!.push(blog);
    return acc;
  }, new Map<number, Map<number, Blog[]>>());

  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold">归档</h1>
        <p className="text-lg text-muted-foreground">
          嗯... 目前共计 <span className="font-medium">{total}</span> 篇博客。
          继续努力！
        </p>
      </div>

      {[...groupedBlogs.keys()].map((year) => (
        <div key={year}>
          <h2 className="mb-4 text-2xl font-bold">
            <span>{year}年</span>
            <span className="ml-4 text-sm font-normal text-muted-foreground">
              共
              {[...groupedBlogs.get(year)!.keys()].reduce(
                (acc, month) =>
                  acc + groupedBlogs.get(year)!.get(month)!.length,
                0,
              )}
              篇博客
            </span>
          </h2>
          {[...groupedBlogs.get(year)!].map(([month, blogs]) => (
            <div key={month}>
              <h3 className="text-xl font-bold">{month}月</h3>
              <ul className="my-4 list-inside">
                {blogs.map((blog) => (
                  <li
                    key={blog.id}
                    className={`
                      mb-4 flex items-center text-muted-foreground
                      hover:text-primary
                    `}
                  >
                    <HugeiconsIcon icon={Book02Icon} className="mr-2 size-4" />

                    <Link
                      href={`${PATHS.BLOG}/${blog.slug}`}
                      className={`flex flex-1 items-center justify-between text-sm`}
                    >
                      <div className="mr-4 line-clamp-1 flex-1 break-all">
                        {blog.title}
                      </div>
                      <div className="w-20 text-xs text-muted-foreground">
                        {formattedDate(new Date(blog.createdAt))}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
