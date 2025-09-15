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

export function SnippetListPageHeader({ extra }: { extra?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">片段列表</h2>
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
            <BreadcrumbLink href={PATHS.ADMIN_SNIPPET}>
              {PATHS_MAP[PATHS.ADMIN_SNIPPET]}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

export function CreateSnippetPageHeader() {
  return (
    <div className="flex flex-col gap-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">创建片段</h2>
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
            <BreadcrumbLink href={PATHS.ADMIN_SNIPPET}>
              {PATHS_MAP[PATHS.ADMIN_SNIPPET]}
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

export function EditSnippetPageHeader() {
  return (
    <div className="flex flex-col gap-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">编辑片段</h2>
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
            <BreadcrumbLink href={PATHS.ADMIN_SNIPPET}>
              {PATHS_MAP[PATHS.ADMIN_SNIPPET]}
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
