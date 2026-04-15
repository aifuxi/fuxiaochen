import { formatDistanceToNow } from "date-fns";
import { FileText, MessageSquareText, RefreshCw, User } from "lucide-react";
import type { ComponentType } from "react";

import { CmsEmptyState } from "@/components/cms/cms-empty-state";
import { CmsFeedbackPanel } from "@/components/cms/cms-feedback-panel";
import { CmsMetricStrip } from "@/components/cms/cms-metric-strip";
import { CmsSectionPanel } from "@/components/cms/cms-section-panel";
import { cn } from "@/lib/utils";

export { CmsEmptyState, CmsFeedbackPanel, CmsMetricStrip, CmsSectionPanel };

export type CmsSummaryGridItem = {
  description?: string;
  label: string;
  value: string;
};

type CmsSummaryGridProps = {
  className?: string;
  items: CmsSummaryGridItem[];
};

type CmsActivityType = "article" | "changelog" | "comment" | "user";

export type CmsActivityListItem = {
  id: string;
  message: string;
  occurredAt: string;
  type: CmsActivityType;
};

type CmsActivityListProps = {
  className?: string;
  description?: string;
  emptyDescription?: string;
  emptyTitle?: string;
  items: CmsActivityListItem[];
  title?: string;
};

const activityToneMap: Record<CmsActivityType, string> = {
  article:
    "border border-[color:var(--color-line-default)] bg-[color:var(--color-surface-2)] text-foreground",
  changelog:
    "border border-[color:var(--color-line-default)] bg-[color:var(--color-surface-2)] text-foreground",
  comment:
    "border border-[color:var(--color-line-default)] bg-[color:var(--color-surface-2)] text-foreground",
  user:
    "border border-[color:var(--color-line-default)] bg-[color:var(--color-surface-2)] text-foreground",
};

const activityLabelMap: Record<CmsActivityType, string> = {
  article: "文章",
  changelog: "更新",
  comment: "评论",
  user: "用户",
};

const activityIconMap: Record<CmsActivityType, ComponentType<{ className?: string }>> = {
  article: FileText,
  changelog: RefreshCw,
  comment: MessageSquareText,
  user: User,
};

export function CmsSummaryGrid({ className, items }: CmsSummaryGridProps) {
  return <CmsMetricStrip className={className} items={items} />;
}

export function CmsActivityList({
  className,
  description,
  emptyDescription = "新的动态会在这里显示。",
  emptyTitle = "暂无活动",
  items,
  title = "活动动态",
}: CmsActivityListProps) {
  return (
    <CmsSectionPanel className={className} description={description} title={title}>
      {items.length === 0 ? (
        <CmsEmptyState description={emptyDescription} title={emptyTitle} />
      ) : (
        <ul className="space-y-3">
          {items.map((item, index) => {
            const ActivityIcon = activityIconMap[item.type];

            return (
              <li
                key={item.id}
                className={`
                  rounded-2xl border
                  border-[color:var(--color-line-default)]
                  bg-[color:var(--color-surface-2)]
                  p-4
                `}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-full",
                      activityToneMap[item.type],
                    )}
                  >
                    <ActivityIcon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {item.message}
                      </span>
                      <span
                        className={`
                          rounded-full border
                          border-[color:var(--color-line-default)]
                          bg-[color:var(--color-surface-1)]
                          px-2 py-0.5 text-[10px] tracking-[0.16em] text-muted uppercase
                        `}
                      >
                        {activityLabelMap[item.type]}
                      </span>
                    </div>
                    <div className="text-xs text-muted">
                      {formatDistanceToNow(new Date(item.occurredAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                  <div className="font-mono-tech text-xs tracking-[0.14em] text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </CmsSectionPanel>
  );
}
