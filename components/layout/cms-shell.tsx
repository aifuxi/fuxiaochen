import { CmsHeader } from "@/components/layout/cms-header";
import { CmsSidebar } from "@/components/layout/cms-sidebar";

type CmsShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function CmsShell({ children, description, title }: CmsShellProps) {
  return (
    <div className="shell-container-lg py-6">
      <div className="flex gap-6">
        <CmsSidebar />
        <div className="min-w-0 flex-1 rounded-[2rem] border border-white/8 bg-black/20 p-6 backdrop-blur-xl">
          <CmsHeader description={description} title={title} />
          {children}
        </div>
      </div>
    </div>
  );
}
