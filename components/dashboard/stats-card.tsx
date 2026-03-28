"use client";

import { motion } from "framer-motion";
import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  icon: LucideIcon;
  iconColor: "articles" | "views" | "comments" | "tags";
  value: string;
  label: string;
  trend: number | string;
  trendDirection: "up" | "down";
  className?: string;
}

const iconColorClasses = {
  articles: "bg-primary/15 text-primary",
  views: "bg-chart-2/15 text-chart-2",
  comments: "bg-chart-3/15 text-chart-3",
  tags: "bg-chart-5/15 text-chart-5",
};

export function StatsCard({
  icon: Icon,
  iconColor,
  value,
  label,
  trend,
  trendDirection,
  className,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative overflow-hidden rounded-xl bg-card p-6 ring-1 ring-foreground/5",
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between">
        <div
          className={cn(
            `
              flex h-12 w-12 items-center justify-center rounded-lg transition-transform
              hover:scale-105
            `,
            iconColorClasses[iconColor],
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div
          className={cn(
            "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
            trendDirection === "up"
              ? "bg-primary/15 text-primary"
              : "bg-destructive/15 text-destructive",
          )}
        >
          {trendDirection === "up" ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {trendDirection === "up" ? "+" : "-"}
          {trend}
        </div>
      </div>
      <div className="mb-1 font-serif text-3xl font-semibold text-foreground">
        {value}
      </div>
      <div className="text-sm text-muted">{label}</div>
    </motion.div>
  );
}
