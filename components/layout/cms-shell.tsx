import { CmsHeader } from "@/components/layout/cms-header";
import { CmsPageHeader } from "@/components/cms/cms-page-header";
import { CmsSidebar } from "@/components/layout/cms-sidebar";
import { requireCmsSession } from "@/lib/auth";

type CmsShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export async function CmsShell({ children, description, title }: CmsShellProps) {
  const session = await requireCmsSession();

  return (
    <div
      className={`
        flex min-h-screen
        bg-[color:var(--color-surface-1)]
      `}
    >
      <CmsSidebar user={session.user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <CmsHeader user={session.user} />
        <main className="min-w-0 flex-1 px-8 py-8">
          <CmsPageHeader className="mb-8" description={description} title={title} />
          {children}
        </main>
      </div>
    </div>
  );
}
