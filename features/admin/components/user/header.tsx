import { CircleSmallIcon } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { PATHS, PATHS_MAP } from "@/constants";

export function UserListPageHeader({ extra }: { extra?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">用户列表</h2>
        {extra}
      </div>

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={PATHS.ADMIN_HOME}>
              {PATHS_MAP[PATHS.ADMIN_HOME]}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <CircleSmallIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href={PATHS.ADMIN_USER}>
              {PATHS_MAP[PATHS.ADMIN_USER]}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
