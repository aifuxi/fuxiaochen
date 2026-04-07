import { CmsHeader } from "@/components/layout/cms-header";
import { CmsSidebar } from "@/components/layout/cms-sidebar";

type CmsShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function CmsShell({ children, description, title }: CmsShellProps) {
  return (
    <div className="admin-layout">
      <CmsSidebar />
      <div className="cms-main">
        <CmsHeader description={description} title={title} />
        <div className="cms-content">{children}</div>
      </div>
    </div>
  );
}
