import Link from "next/link";

import { InboxIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { getCategoryList } from "@/api/category";
import { PATHS } from "@/constants/path";

export const revalidate = 60;

export default async function Page() {
  const resp = await getCategoryList({
    page: 1,
    pageSize: 10000,
  });

  const { lists = [] } = resp.data;

  return (
    <div>
      <div className="container mx-auto px-4 py-16">
        <div className="mb-12">
          <h1 className="mb-4 text-4xl font-bold">分类</h1>
          <p className="text-lg text-muted-foreground">按分类浏览全部博客</p>
        </div>

        <div
          className={`
            grid gap-6
            md:grid-cols-2
          `}
        >
          {lists?.map((category) => {
            return (
              <Link
                key={category.slug}
                href={`${PATHS.CATEGORY}/${category.slug}`}
              >
                <div
                  className={`
                    group h-full cursor-pointer rounded-lg border border-border bg-card p-8 transition-colors
                    hover:border-primary/50
                  `}
                >
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-muted`}
                  >
                    <HugeiconsIcon icon={InboxIcon} className="h-6 w-6" />
                  </div>

                  <h3
                    className={`
                      mb-2 text-2xl font-bold transition-colors
                      group-hover:text-primary
                    `}
                  >
                    {category.name}
                  </h3>
                  <p className="mb-4 text-muted-foreground">
                    {category.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      {category.blogCount} 篇博客
                    </span>
                    <span className="font-medium text-primary">浏览 →</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
