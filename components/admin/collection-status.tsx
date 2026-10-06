import { ArrowUpRight, CirclePause, Info } from "lucide-react";
import Link from "next/link";

import type { CollectionInfo } from "@/lib/analytics/schema";

import { Button } from "@/components/ui/button";
import { postTime } from "@/lib/posts/schema";

import "./collection-status.css";

export function CollectionStatus({
  collection,
  incomplete = false,
}: {
  collection: CollectionInfo;
  incomplete?: boolean;
}) {
  const inactive = !collection.enabled || !collection.production;
  if (!inactive && !incomplete) return null;

  const Icon = inactive ? CirclePause : Info;
  const title = !collection.enabled
    ? "访问统计已关闭"
    : !collection.production
      ? "当前环境不采集访问"
      : "统计区间未完全覆盖";

  return (
    <section className="admin-collection-status" aria-label="访问统计状态">
      <Icon className="admin-collection-icon" size={20} aria-hidden="true" />
      <div className="admin-collection-content">
        <p className="admin-collection-title">{title}</p>
        <p className="admin-collection-description">
          {!collection.enabled
            ? "历史数据仍可查询，可在统计设置中开启采集。"
            : !collection.production
              ? "采集开关已开启；仅在生产环境记录新访问，历史数据仍可查询。"
              : "以下指标按实际保留的访问记录计算。"}
          {!collection.enabled && !collection.production && " 当前环境不采集访问。"}
        </p>
        {incomplete && (
          <p className="admin-collection-coverage">
            <span>数据可用起点</span>
            <time dateTime={collection.availableFrom}>{postTime(collection.availableFrom)}</time>
            <span>（北京时间）· 更早日期无可用记录</span>
          </p>
        )}
      </div>
      {inactive && (
        <Button
          render={(props) => {
            // 保留真实链接语义，移除非原生 Button 默认添加的按钮角色。
            const { role: _role, ...linkProps } = props;
            return <Link {...linkProps} href="/admin/settings?group=analytics" />;
          }}
          nativeButton={false}
          size="compact"
          variant="secondary"
          className="admin-collection-action"
        >
          统计设置 <ArrowUpRight size={14} aria-hidden="true" />
        </Button>
      )}
    </section>
  );
}
