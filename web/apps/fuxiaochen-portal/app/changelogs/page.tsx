import { GithubIcon, LinkSquare02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import BytemdViewer from "@/components/bytemd";

import { getChangelogList } from "@/api/changelog";
import { SOURCE_CODE_GITHUB_PAGE } from "@/constants";
import { formattedDate } from "@/lib/common";

export default async function ChangelogPage() {
  const resp = await getChangelogList({
    page: 1,
    pageSize: 10000,
  });

  const { lists = [] } = resp;

  return (
    <div>
      <main className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-12">
          <h1
            className={`
              mb-4 text-4xl font-bold text-balance
              md:text-5xl
            `}
          >
            更新日志
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            追踪本网站发布的所有更新、改进内容及新功能。
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {!lists?.length ? (
            <div className="text-center text-muted-foreground">
              暂无更新日志
            </div>
          ) : (
            <>
              {/* Timeline line */}
              <div
                className={`absolute top-0 bottom-0 left-8 w-0.5 bg-linear-to-b from-primary to-primary/20`}
              />

              {/* Changelog entries */}
              <div className="space-y-8">
                {lists?.map((entry, index) => (
                  <div key={index} className={`relative pl-20`}>
                    {/* Timeline dot and date */}
                    <div
                      className={`absolute top-1 left-0 flex h-16 w-16 items-center justify-center`}
                    >
                      <div className="relative z-10 h-4 w-4 rounded-full border-4 border-background bg-primary" />
                    </div>

                    {/* Entry card */}
                    <div
                      className={`
                        rounded-lg border border-border bg-card p-6 transition-colors
                        hover:border-primary/50
                      `}
                    >
                      <BytemdViewer body={entry.content || ""} />

                      <div
                        className={`pt-6 text-xs font-medium whitespace-nowrap text-muted-foreground`}
                      >
                        发布于&nbsp;
                        {formattedDate(new Date(entry.date || entry.createdAt))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer CTA */}
        <div className="mt-16 border-t border-border pt-12 text-center">
          <p className="mb-4 text-muted-foreground">
            想要提出功能建议或者报告问题吗？
          </p>
          <a
            href={`${SOURCE_CODE_GITHUB_PAGE}/issues`}
            target="_blank"
            className={`
              inline-flex items-center gap-2 font-medium text-primary transition-colors
              hover:text-primary/80
            `}
          >
            <HugeiconsIcon icon={GithubIcon} className="h-5 w-5" />去 GitHub
            反馈 <HugeiconsIcon icon={LinkSquare02Icon} className="h-5 w-5" />
          </a>
        </div>
      </main>
    </div>
  );
}
