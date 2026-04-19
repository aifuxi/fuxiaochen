"use client";

import { usePathname } from "next/navigation";

import { getAdminPageContext } from "./admin-navigation";
import { AdminSidebar } from "./admin-sidebar";
import { AdminToolbar } from "./admin-toolbar";

type AdminShellFrameProps = {
  children: React.ReactNode;
  pathname: string;
  title?: string;
  description?: string;
};

export function AdminShellFrame({
  children,
  pathname,
  title,
  description,
}: AdminShellFrameProps) {
  const pageContext = getAdminPageContext(pathname);

  return (
    <div className="ui-admin-shell">
      <AdminSidebar pathname={pathname} />

      <div className="min-w-0 bg-canvas/70">
        <AdminToolbar
          pathname={pathname}
          section={pageContext.section}
          title={title ?? pageContext.title}
          description={description ?? pageContext.description}
        />
        <div className="min-h-[calc(100dvh-5.5rem)]">{children}</div>
      </div>
    </div>
  );
}

export function AdminShell({
  children,
  title,
  description,
}: Omit<AdminShellFrameProps, "pathname">) {
  const pathname = usePathname();

  return (
    <AdminShellFrame
      pathname={pathname}
      title={title}
      description={description}
    >
      {children}
    </AdminShellFrame>
  );
}
