import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

import { PATHS } from "@/constants/path";
import { cn } from "@/lib/utils";

import { getAllTags } from "./actions";

export const revalidate = 60;

export default async function Page() {
  const { tags } = await getAllTags();

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
        {tags.map((el) => (
          <Link
            key={el.id}
            href={`${PATHS.TAG}/${el.slug}`}
            className={cn(
              buttonVariants({
                variant: "outline",
              }),
            )}
          >
            {el.iconDark && (
              <img
                src={el.iconDark}
                alt={el.name}
                className={`
                  inline-flex size-5
                  dark:hidden
                `}
              />
            )}
            {el.icon && (
              <img
                src={el.icon}
                alt={el.name}
                className={`
                  hidden size-5
                  dark:inline-flex
                `}
              />
            )}
            <span>{el.name}</span>
            {el.blogs.length > 0 && (
              <Badge key={el.id} variant="secondary" className="rounded-full">
                {el.blogs.length}
              </Badge>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
