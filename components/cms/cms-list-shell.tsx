import type React from "react";

type CmsListShellProps = {
  filters?: React.ReactNode;
  body: React.ReactNode;
};

export function CmsListShell({ body, filters }: CmsListShellProps) {
  return (
    <div className="space-y-6">
      {filters}
      {body}
    </div>
  );
}
