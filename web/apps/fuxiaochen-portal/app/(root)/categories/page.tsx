import Link from "next/link";

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
    <div className="mx-auto flex min-h-screen max-w-wrapper flex-col px-6 pt-8 pb-24">
      <h2
        className={`
          pb-8 text-3xl font-bold
          md:text-4xl
        `}
      >
        分类
      </h2>

      <div className="grid grid-cols-2 gap-8">
        {lists.map((el) => (
          <Link
            key={el.id}
            href={`${PATHS.CATEGORY}/${el.slug}`}
            className={`
              flex items-center justify-between rounded-2xl border border-solid border-border px-6 py-8 text-4xl
              font-medium
            `}
          >
            <span>{el.name}</span>
            <span className="text-sm text-muted-foreground">
              共{el?.blogs?.length || 0}篇博客
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
