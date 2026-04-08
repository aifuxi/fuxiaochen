import { CmsHeader } from "@/components/layout/cms-header";
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
    <div className="admin-layout">
      <CmsSidebar user={session.user} />
      <div className="cms-main">
        <CmsHeader description={description} title={title} user={session.user} />
        <div className="cms-content">{children}</div>
      </div>
    </div>
  );
}
