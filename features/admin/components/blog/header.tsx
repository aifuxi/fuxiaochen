import * as React from "react";

import { CircleSmallIcon } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { PATHS, PATHS_MAP } from "@/constants";

export function BlogListPageHeader({ extra }: { extra?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">博客列表</h2>
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
            <BreadcrumbLink href={PATHS.ADMIN_BLOG}>
              {PATHS_MAP[PATHS.ADMIN_BLOG]}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

export function CreateBlogPageHeader() {
  return (
    <div className="flex flex-col gap-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">创建博客</h2>
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
            <BreadcrumbLink href={PATHS.ADMIN_BLOG}>
              {PATHS_MAP[PATHS.ADMIN_BLOG]}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <CircleSmallIcon />
          </BreadcrumbSeparator>

          <BreadcrumbItem>创建</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

export function EditBlogPageHeader() {
  return (
    <div className="flex flex-col gap-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">编辑博客</h2>
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
            <BreadcrumbLink href={PATHS.ADMIN_BLOG}>
              {PATHS_MAP[PATHS.ADMIN_BLOG]}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <CircleSmallIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>编辑</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
