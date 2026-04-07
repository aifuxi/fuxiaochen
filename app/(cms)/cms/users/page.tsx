import { ResourceTable } from "@/components/blocks/resource-table";
import { CmsShell } from "@/components/layout/cms-shell";
import { userRows } from "@/lib/mocks/cms-content";

export default function CmsUsersPage() {
  return (
    <CmsShell description="User management in the first pass focuses on role and invitation visibility." title="Users">
      <ResourceTable
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "role", label: "Role" },
          { key: "status", label: "Status" },
        ]}
        rows={userRows}
      />
    </CmsShell>
  );
}
