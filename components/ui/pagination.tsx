import Link from "next/link";

import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
};

export function Pagination({ buildHref, page, totalPages }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        className={cn(buttonVariants({ size: "sm", variant: "outline" }), page === 1 && "pointer-events-none opacity-40")}
        href={buildHref(Math.max(page - 1, 1))}
      >
        上一页
      </Link>
      {pages.map((item) => (
        <Link
          key={item}
          className={cn(
            buttonVariants({ size: "sm", variant: item === page ? "primary" : "ghost" }),
            "min-w-9 justify-center rounded-2xl px-0",
          )}
          href={buildHref(item)}
        >
          {item}
        </Link>
      ))}
      <Link
        className={cn(
          buttonVariants({ size: "sm", variant: "outline" }),
          page === totalPages && "pointer-events-none opacity-40",
        )}
        href={buildHref(Math.min(page + 1, totalPages))}
      >
        下一页
      </Link>
    </div>
  );
}
