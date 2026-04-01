import type { ReactNode } from "react";
import { CmsHeader } from "@/components/layouts/cms-header";
import { CmsSidebar } from "@/components/layouts/cms-sidebar";

export function CmsShell({
  children,
  currentPath,
  title,
  description,
}: {
  children: ReactNode;
  currentPath: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="min-h-screen bg-bg">
      <div className="flex min-h-screen">
        <CmsSidebar currentPath={currentPath} />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <CmsHeader description={description} title={title} />
          <main className={`
            flex-1 px-6 py-8
            lg:px-8
          `}>
            <div className="mx-auto max-w-[calc(100vw-22rem)] min-w-0">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
