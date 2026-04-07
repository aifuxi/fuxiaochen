import { CmsShell } from "@/components/layout/cms-shell";
import { userRows } from "@/lib/mocks/cms-content";

export default function CmsUsersPage() {
  return (
    <CmsShell description="Manage roles, access, and invitation state across your editorial workspace." title="Users">
      <div className="mb-6 flex items-center gap-3">
        <select className="select-dropdown rounded-xl px-4 py-2 text-sm text-white">
          <option>All Roles</option>
          <option>Admin</option>
          <option>Editor</option>
          <option>Author</option>
        </select>
        <select className="select-dropdown rounded-xl px-4 py-2 text-sm text-white">
          <option>All Status</option>
          <option>Active</option>
          <option>Invited</option>
        </select>
        <button className="btn-primary-glow ml-auto rounded-xl px-4 py-3 text-sm font-semibold">Invite User</button>
      </div>

      <div className="glass-card overflow-hidden rounded-2xl border border-white/8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#0a0a0a] text-left">
              <th className="font-mono-tech px-6 py-4 text-xs tracking-[0.05em] text-muted uppercase">User</th>
              <th className="font-mono-tech px-6 py-4 text-xs tracking-[0.05em] text-muted uppercase">Role</th>
              <th className="font-mono-tech px-6 py-4 text-xs tracking-[0.05em] text-muted uppercase">Status</th>
              <th className="font-mono-tech px-6 py-4 text-xs tracking-[0.05em] text-muted uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {userRows.map((user, index) => (
              <tr key={user.email} className={`
                border-t border-white/8 transition
                hover:bg-white/4
              `}>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className={`
                      flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white
                      ${index === 0 ? `bg-red-500/70` : index === 1 ? `bg-primary/70` : `bg-indigo-500/70`}
                    `}>
                      {user.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{user.name}</div>
                      <div className="text-xs text-muted">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`
                    rounded-full px-3 py-1 text-xs
                    ${user.role === "Admin" ? `bg-red-500/10 text-red-400` : user.role === "Editor" ? `
                      bg-sky-500/10 text-sky-400
                    ` : `bg-primary/10 text-primary`}
                  `}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className={`
                    inline-flex items-center gap-2 text-xs
                    ${user.status === "Active" ? "text-primary" : `text-red-400`}
                  `}>
                    <span className={`
                      h-2 w-2 rounded-full
                      ${user.status === "Active" ? "bg-primary" : "bg-red-500"}
                    `} />
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-sm text-muted">Edit · Remove</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CmsShell>
  );
}
