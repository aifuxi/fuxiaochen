import React from 'react';

import { Book, CodeXml, ScrollIcon, TagsIcon } from 'lucide-react';

import { PageBreadcrumb } from '@/components/page-header';

import { PATHS } from '@/constants';
import { getStatistics } from '@/features/statistics';

import { AdminContentLayout } from '../../components';
import { type StatisticsCardProps } from '../../types';

export const AdminStatisticPage = async () => {
  const { blogCount, snippetCount, tagCount, noteCount } =
    await getStatistics();

  const statistics: StatisticsCardProps[] = [
    {
      title: '博客',
      count: blogCount,
      icon: <Book className="text-muted-foreground text-2xl" />,
    },
    {
      title: '片段',
      count: snippetCount,
      icon: <CodeXml className="text-muted-foreground w-6 h-6" />,
    },
    {
      title: '标签',
      count: tagCount,
      icon: <TagsIcon className="text-muted-foreground w-6 h-6" />,
    },
    {
      title: '笔记',
      count: noteCount,
      icon: <ScrollIcon className="text-muted-foreground w-6 h-6" />,
    },
  ];

  return (
    <AdminContentLayout
      breadcrumb={
        <PageBreadcrumb
          breadcrumbList={[PATHS.ADMIN_HOME, PATHS.ADMIN_STATISTIC]}
        />
      }
    >
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
    </AdminContentLayout>
  );
};
