import React from 'react';

import { IconSolarBook, IconSolarHashtagSquare } from '@/components/icons';

import { getStatistics } from '../../actions/statistics';
import { type StatisticsCardProps } from '../../types';

export const AdminHomePage = async () => {
  const { articleCount, tagCount } = await getStatistics();

  const statistics: StatisticsCardProps[] = [
    {
      title: '文章总数',
      count: articleCount,
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
      <h2 className="text-3xl font-semibold tracking-tight transition-colors">
        首页
      </h2>

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
