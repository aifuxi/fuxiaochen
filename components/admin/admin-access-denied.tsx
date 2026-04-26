import Link from "next/link";

import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import { routes } from "@/constants/routes";

type AdminAccessDeniedProps = {
  title?: string;
  description?: string;
};

export function AdminAccessDenied({
  title = "访问被拒绝",
  description = "你已登录，但该账号没有权限查看当前页面。",
}: AdminAccessDeniedProps) {
  return (
    <Empty className="min-h-[calc(100vh-12rem)] border border-dashed border-border bg-card">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ShieldAlert className="size-5" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href={routes.admin.root}>返回仪表盘</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={routes.site.home}>返回站点</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
