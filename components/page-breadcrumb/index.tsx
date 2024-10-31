import * as React from "react";

import { PATHS_MAP } from "@/constants";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";

type PageBreadcrumbProps = {
  breadcrumbList?: string[];
};

export const PageBreadcrumb = ({ breadcrumbList }: PageBreadcrumbProps) => {
  if (!breadcrumbList?.length) {
    return null;
  }

  const linkList = breadcrumbList.slice(0, breadcrumbList.length - 1);
  const labelLink = breadcrumbList[breadcrumbList.length - 1]!;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {linkList.map((el) => (
          <React.Fragment key={el}>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href={el}>{PATHS_MAP[el]}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </React.Fragment>
        ))}
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbPage>{PATHS_MAP[labelLink]}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
