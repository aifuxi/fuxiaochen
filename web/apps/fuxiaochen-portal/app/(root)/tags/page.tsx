import Link from "next/link";

import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { getTagList } from "@/api/tag";
import { PATHS } from "@/constants";

export const revalidate = 60;

export default async function Page() {
  const resp = await getTagList({
    page: 1,
    pageSize: 10000,
  });

  const { lists = [] } = resp.data;

  return (
    <div>
      <div className="container mx-auto px-4 py-16">
        <div className="mb-12">
          <h1 className="mb-4 text-4xl font-bold">标签</h1>
          <p className="text-lg text-muted-foreground">按主题浏览全部博客</p>
        </div>

        <div
          className={`
            grid gap-4
            md:grid-cols-2
            lg:grid-cols-3
          `}
        >
          {lists?.map((tag) => (
            <Link
              key={tag.name}
              href={`${PATHS.TAG}/${tag.name.toLowerCase()}`}
            >
              <div
                className={`
                  group h-full cursor-pointer rounded-lg border border-border bg-card p-6 transition-colors
                  hover:border-primary/50
                `}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3
                      className={`
                        text-xl font-bold transition-colors
                        group-hover:text-primary
                      `}
                    >
                      {tag.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {tag.blogCount} 篇博客
                    </p>
                  </div>
                  <HugeiconsIcon
                    icon={ArrowRight02Icon}
                    className={`
                      h-4 w-4 text-muted-foreground transition-colors
                      group-hover:translate-x-1 group-hover:text-primary
                    `}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
