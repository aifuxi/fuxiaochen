import type React from "react";

type CmsListShellProps = {
  filters?: React.ReactNode;
  metrics?: React.ReactNode;
  body: React.ReactNode;
};

export function CmsListShell({ body, filters, metrics }: CmsListShellProps) {
  return (
    <div className="space-y-6">
      {filters}
      {metrics}
      {body}
    </div>
  );
}
