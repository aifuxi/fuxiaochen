import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function ArticleBackLink() {
  return (
    <Button
      className="site-back"
      variant="ghost"
      size="compact"
      nativeButton={false}
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- render 输出真实链接，保留页面导航语义。
      role="link"
      render={<Link href="/posts" />}
    >
      <ArrowLeft size={16} aria-hidden="true" />
      返回文章列表
    </Button>
  );
}
