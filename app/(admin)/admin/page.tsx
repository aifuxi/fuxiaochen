import { type Metadata } from 'next';

import { BookAIcon, TagIcon } from 'lucide-react';

import { countStatistics } from '@/app/actions/statistics';

export const metadata: Metadata = {
  title: '首页',
};

type StatisticsCardProps = {
  title: string;
  count: number;
  icon: React.ReactNode;
};

export default async function AdminPage() {
  const { articleCount, tagCount } = await countStatistics();

  const statistics: StatisticsCardProps[] = [
    {
      title: '文章总数',
      count: articleCount,
      icon: <BookAIcon size={24} className="text-muted-foreground" />,
    },
    {
      title: '标签总数',
      count: tagCount,
      icon: <TagIcon size={24} className="text-muted-foreground" />,
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
            <div key={el.title} className="border bg-card text-card-foreground">
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
}
