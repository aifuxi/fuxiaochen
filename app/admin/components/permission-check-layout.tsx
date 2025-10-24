"use client";

import Link from "next/link";

import { LoaderCircle } from "lucide-react";
import useSWR from "swr";

import { noAdminPermission } from "@/app/actions";

import { Button } from "@/components/ui/button";

import { IllustrationNoAccess } from "@/components/illustrations";

import { PATHS } from "@/constants";

export function PermissionCheckLayout({ children }: React.PropsWithChildren) {
  const { data: noPermission, isLoading } = useSWR(
    "check-permission",
    async () => await noAdminPermission(),
  );
  if (isLoading) {
    return (
      <div className="flex min-h-72 items-center justify-center">
        <LoaderCircle className="size-9 animate-spin" />
      </div>
    );
  }

  if (noPermission) {
    return (
      <div className="flex items-center justify-center">
        <div className="grid place-items-center gap-8">
          <IllustrationNoAccess className="size-[320px]" />
          <h3 className="text-center text-2xl font-semibold tracking-tight">
            没有权限访问
          </h3>
          <Button asChild>
            <Link href={PATHS.ADMIN_HOME}>返回后台首页</Link>
          </Button>
        </div>
      </div>
    );
  }

  return children;
}
