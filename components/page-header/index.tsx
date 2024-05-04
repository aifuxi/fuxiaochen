import React from 'react';

import { PATHS_MAP } from '@/constants';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';

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
            <BreadcrumbItem>
              <BreadcrumbLink href={el}>{PATHS_MAP[el]}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </React.Fragment>
        ))}
        <BreadcrumbItem>
          <BreadcrumbPage>{PATHS_MAP[labelLink]}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
