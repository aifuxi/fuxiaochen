import Link from "next/link";

import { Button } from "@/components/ui/button";

import { IllustrationNoAccess } from "@/components/illustrations";

import { PATHS } from "@/constants";
import { AdminUserListPage } from "@/features/admin";
import { noAdminPermission } from "@/features/user";

export default async function Page() {
  if (await noAdminPermission()) {
    return (
      <div className="grid h-full place-items-center">
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

  return <AdminUserListPage />;
}
