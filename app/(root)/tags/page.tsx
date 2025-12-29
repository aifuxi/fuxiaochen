import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

import { getTagList } from "@/api/tag";
import { PATHS } from "@/constants/path";
import { cn } from "@/lib/utils";

export const revalidate = 60;

export default async function Page() {
  const resp = await getTagList({
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
        标签
      </h2>

      <div className="flex flex-wrap gap-4">
        {lists.map((el) => (
          <Link
            key={el.id}
            href={`${PATHS.TAG}/${el.slug}`}
            className={cn(
              buttonVariants({
                variant: "outline",
              }),
            )}
          >
            <span>{el.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
