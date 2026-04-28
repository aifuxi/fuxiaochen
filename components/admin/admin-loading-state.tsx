"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { TableCell, TableRow } from "@/components/ui/table";

import { cn } from "@/lib/utils";

type AdminTableStateRowProps = {
  colSpan: number;
  label?: string;
};

type AdminTableErrorRowProps = AdminTableStateRowProps & {
  onRetry?: () => void;
};

type AdminContentStateProps = {
  label?: string;
  onRetry?: () => void;
};

export function AdminTableLoadingRow({
  colSpan,
  label = "正在加载数据...",
}: AdminTableStateRowProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="py-12 text-center">
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner />
          {label}
        </span>
      </TableCell>
    </TableRow>
  );
}

export function AdminTableErrorRow({
  colSpan,
  label = "数据加载失败",
  onRetry,
}: AdminTableErrorRowProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="py-12 text-center">
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-destructive">{label}</p>
          {onRetry ? (
            <Button variant="outline" size="sm" onClick={onRetry}>
              重试
            </Button>
          ) : null}
        </div>
      </TableCell>
    </TableRow>
  );
}

export function AdminContentLoading({
  label = "正在加载数据...",
}: AdminContentStateProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
      <Spinner />
      {label}
    </div>
  );
}

export function AdminContentError({
  label = "数据加载失败",
  onRetry,
}: AdminContentStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <p className="text-sm text-destructive">{label}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          重试
        </Button>
      ) : null}
    </div>
  );
}

export function AdminCardSkeletonGrid({
  className,
  count = 4,
}: {
  className?: string;
  count?: number;
}) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="size-4 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-12" />
            <div className="mt-2 flex items-center gap-1">
              <Skeleton className="size-3 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
