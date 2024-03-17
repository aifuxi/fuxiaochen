import React from 'react';

import Link from 'next/link';

import { PATHS_MAP, PATH_DESCRIPTION_MAP } from '@/constants';
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
  action?: React.ReactNode;
};

export const PageHeader = ({
  breadcrumbList,
  className,
  action,
}: PageHeaderProps) => {
  if (!breadcrumbList?.length) {
    return null;
  }

  const linkList = breadcrumbList.slice(0, breadcrumbList.length - 1);
  const labelLink = breadcrumbList[breadcrumbList.length - 1]!;

  return (
    <div className={cn('relative', className)}>
      <Breadcrumb className={cn('mb-2')}>
        <BreadcrumbList>
          {linkList.map((el) => (
            <React.Fragment key={el}>
              <BreadcrumbItem>
                <BreadcrumbLink>
                  <Link href={el}>{PATHS_MAP[el]}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </React.Fragment>
          ))}
          <BreadcrumbItem>
            <BreadcrumbPage>{PATHS_MAP[labelLink]}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h2 className="text-3xl md:text-4xl font-bold mb-2">
        {PATHS_MAP[labelLink]}
      </h2>
      <p className="text-base text-muted-foreground">
        {PATH_DESCRIPTION_MAP[labelLink]}
      </p>

      <div className="absolute bottom-4 right-4">{action}</div>
    </div>
  );
};
