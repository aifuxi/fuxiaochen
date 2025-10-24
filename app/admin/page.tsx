import { type Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

import { PATHS } from "@/constants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "首页",
};

export default function Page() {
  const guessList: { label: string; link: string }[] = [
    { label: "创建标签", link: PATHS.ADMIN_TAG },
    { label: "创建博客", link: PATHS.ADMIN_BLOG },
    { label: "创建分类", link: PATHS.ADMIN_CATEGORY },
  ];

  return (
    <div className="mt-[18vh] grid place-content-center gap-4">
      <h2 className="text-3xl font-medium">欢迎使用后台管理系统</h2>
      <p className="text-lg text-muted-foreground">你可能想 🤔</p>

      <div className="flex space-x-4">
        {guessList.map((el) => (
          <Link
            key={el.link}
            className={cn(buttonVariants({ variant: "outline" }))}
            href={el.link}
          >
            {el.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
