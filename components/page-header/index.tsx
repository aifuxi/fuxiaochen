import React from 'react';

import Link from 'next/link';

import { PATHS_MAP, PATH_DESCRIPTION_MAP } from '@/config';

import { cn } from '@/lib/utils';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';

type PageHeaderProps = {
  breadcrumbList?: string[];
  className?: string;
};

export const PageHeader = ({ breadcrumbList, className }: PageHeaderProps) => {
  if (!breadcrumbList?.length) {
    return null;
  }

  const linkList = breadcrumbList.slice(0, breadcrumbList.length - 1);
  const labelLink = breadcrumbList[breadcrumbList.length - 1]!;

  return (
    <>
      <Breadcrumb className={cn('mb-4', className)}>
        <BreadcrumbList>
          {linkList.map((el) => (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink>
                  <Link href={el}>{PATHS_MAP[el]}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          ))}
          <BreadcrumbItem>
            <BreadcrumbPage>{PATHS_MAP[labelLink]}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h2 className="text-4xl md:text-5xl font-bold mb-4">
        {PATHS_MAP[labelLink]}
      </h2>
      <p className="text-lg text-muted-foreground mb-9">
        {PATH_DESCRIPTION_MAP[labelLink]}
      </p>
    </>
  );
};
