import Link from "next/link";

import { ArrowUpRight } from "lucide-react";

import type { AdminPageContext } from "./admin-navigation";

type AdminToolbarProps = AdminPageContext & {
  pathname: string;
};

export function AdminToolbar({
  pathname,
  section,
  title,
  description,
}: AdminToolbarProps) {
  return (
    <header className="ui-admin-toolbar">
      <div className="flex flex-col gap-5 px-6 py-5 md:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="ui-eyebrow">{section}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h2 className="text-title-lg font-light tracking-[-0.05em] text-text-strong">
              {title}
            </h2>
            <span className="ui-admin-chip">{pathname}</span>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-text-soft">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/" className="ui-admin-button">
            Open site
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}
