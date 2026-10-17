"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { requestArticleListRestore } from "./article-list-position";

export function ArticleBackLink({
  href = "/posts",
  text = "返回文章列表",
  direction = "back",
  className = "mb-[var(--space-xl)]",
}: {
  href?: string;
  text?: string;
  direction?: "back" | "forward";
  className?: string;
}) {
  const router = useRouter();

  return (
    <Button
      className={className}
      variant="ghost"
      size="compact"
      nativeButton={false}
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- render 输出真实链接，保留页面导航语义。
      role="link"
      render={
        <Link
          href={href}
          onNavigate={(event) => {
            // href 已由详情服务端校验；仅有可恢复记录时接管滚动，否则保留原生行为。
            if (!requestArticleListRestore(href)) return;
            event.preventDefault();
            router.push(href, { scroll: false });
          }}
        />
      }
    >
      {direction === "back" && <ArrowLeft size={16} aria-hidden="true" />}
      {text}
      {direction === "forward" && <ArrowRight size={16} aria-hidden="true" />}
    </Button>
  );
}
