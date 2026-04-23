import Link from "next/link";

import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import { routes } from "@/constants/routes";

type AdminAccessDeniedProps = {
  title?: string;
  description?: string;
};

export function AdminAccessDenied({
  title = "Access denied",
  description = "You are signed in, but your account does not have permission to view this page.",
}: AdminAccessDeniedProps) {
  return (
    <Empty className="border-border bg-card min-h-[calc(100vh-12rem)] border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ShieldAlert className="size-5" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href={routes.admin.root}>Back to dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={routes.site.home}>Go to site</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
