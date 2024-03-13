import React from 'react';

import Link from 'next/link';

import { PATHS, PATHS_MAP } from '@/config';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

import { IconSolarBook, IconSolarHashtagSquare } from '@/components/icons';

import { getStatistics } from '../../actions/statistics';
import { type StatisticsCardProps } from '../../types';

export const AdminStatisticPage = async () => {
  const { blogCount, tagCount } = await getStatistics();

  const statistics: StatisticsCardProps[] = [
    {
      title: 'Blog总数',
      count: blogCount,
      icon: <IconSolarBook className="text-muted-foreground text-2xl" />,
    },
    {
      title: '标签总数',
      count: tagCount,
      icon: (
        <IconSolarHashtagSquare className="text-muted-foreground text-2xl" />
      ),
    },
  ];

  return (
    <div className="h-screen flex flex-col gap-4">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>
              <Link href={PATHS.ADMIN_HOME}>{PATHS_MAP[PATHS.ADMIN_HOME]}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{PATHS_MAP[PATHS.ADMIN_STATISTIC]}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h2 className="text-4xl md:text-5xl font-bold mb-2">
        {PATHS_MAP[PATHS.ADMIN_STATISTIC]}
      </h2>
      <p className="text-lg text-muted-foreground">聚合本站的所有统计数据</p>

      <div className="flex-1">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statistics.map((el) => (
            <div
              key={el.title}
              className="border bg-card text-card-foreground rounded-lg"
            >
              <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight font-medium">{el.title}</h3>
                {el.icon}
              </div>
              <div className="p-6 pt-0">
                <div className="text-2xl font-bold">{el.count}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
