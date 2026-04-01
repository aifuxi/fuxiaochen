import { CmsShell } from "@/components/layouts/cms-shell";
import { users } from "@/lib/mock/design-content";

export default function CmsUsersPage() {
  return (
    <CmsShell
      currentPath="/cms/users"
      description="Users is scaffolded so management pages can share the same shell and data patterns."
      title="Users"
    >
      <section className="space-y-6">
        <div className="cms-card p-5">
          <div className="flex flex-wrap items-center gap-3">
            <input className={`
              h-10 min-w-64 rounded-md border border-border bg-surface px-4 text-sm text-fg outline-none
              placeholder:text-muted
              focus:border-primary
            `} placeholder="Search users..." />
            <select className={`
              h-10 rounded-md border border-border bg-surface px-4 text-sm text-fg outline-none
              focus:border-primary
            `}>
              <option>All roles</option>
              <option>Admin</option>
              <option>Author</option>
              <option>Reader</option>
            </select>
            <button type="button" className={`
              ml-auto rounded-md bg-primary px-4 py-2 font-medium text-primary-fg transition-colors
              hover:bg-primary-h
            `}>
              Add user
            </button>
          </div>
        </div>
        <div className="cms-card overflow-hidden">
          <div className={`
            grid grid-cols-[1.6fr_140px_120px_140px_120px] border-b border-border bg-bg-elevated/70 px-6 py-4 font-mono
            text-[11px] tracking-[0.16em] text-muted uppercase
          `}>
            <span>User</span>
            <span>Role</span>
            <span>Status</span>
            <span>Joined</span>
            <span>Actions</span>
          </div>
          {users.map((user) => (
            <div key={user.email} className={`
              grid grid-cols-[1.6fr_140px_120px_140px_120px] items-center border-b border-border/80 px-6 py-5 text-sm
              last:border-b-0
            `}>
              <div className="flex items-center gap-4">
                <div className={`
                  flex size-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-fg
                `}>
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-fg">{user.name}</div>
                  <div className="text-xs text-muted">{user.email}</div>
                </div>
              </div>
              <span className="inline-flex w-fit rounded-full bg-white/8 px-3 py-1 text-xs text-fg">{user.role}</span>
              <span className={`
                inline-flex items-center gap-2 text-xs
                ${user.status === "Active" ? "text-primary" : `text-error`}
              `}>
                <span className={`
                  size-2 rounded-full
                  ${user.status === "Active" ? "bg-primary" : "bg-error"}
                `} />
                {user.status}
              </span>
              <span className="text-muted">{user.joined}</span>
              <div className="flex gap-2">
                <button type="button" className="rounded-md border border-border px-3 py-1.5 text-xs text-muted">
                  Edit
                </button>
                <button type="button" className="rounded-md border border-error/30 px-3 py-1.5 text-xs text-error">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </CmsShell>
  );
}
