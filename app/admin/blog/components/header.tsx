import * as React from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { PATHS } from "@/constants";

export function BlogListPageHeader({ extra }: { extra?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">博客管理</h2>
        {extra}
      </div>

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={PATHS.ADMIN_HOME}>首页</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={PATHS.ADMIN_BLOG}>博客管理</BreadcrumbLink>
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
            <BreadcrumbLink href={PATHS.ADMIN_HOME}>首页</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={PATHS.ADMIN_BLOG}>博客管理</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />

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
            <BreadcrumbLink href={PATHS.ADMIN_HOME}>首页</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={PATHS.ADMIN_BLOG}>博客管理</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>编辑</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
