import React from "react";

import { Book, CodeXml, ScrollIcon, TagsIcon } from "lucide-react";

import { PageBreadcrumb } from "@/components/page-header";

import { PATHS } from "@/constants";
import { getStatistics } from "@/features/statistics";

import { AdminContentLayout } from "../../components";
import { type StatisticsCardProps } from "../../types";

export const AdminStatisticPage = async () => {
  const { blogCount, snippetCount, tagCount, noteCount } =
    await getStatistics();

  const statistics: StatisticsCardProps[] = [
    {
      title: "博客",
      count: blogCount,
      icon: <Book className="text-2xl text-muted-foreground" />,
    },
    {
      title: "片段",
      count: snippetCount,
      icon: <CodeXml className="size-6 text-muted-foreground" />,
    },
    {
      title: "标签",
      count: tagCount,
      icon: <TagsIcon className="size-6 text-muted-foreground" />,
    },
    {
      title: "笔记",
      count: noteCount,
      icon: <ScrollIcon className="size-6 text-muted-foreground" />,
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
        <div className="mb-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statistics.map((el) => (
            <div
              key={el.title}
              className="rounded-lg border bg-card text-card-foreground"
            >
              <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
                <h3 className="font-medium tracking-tight">{el.title}</h3>
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
