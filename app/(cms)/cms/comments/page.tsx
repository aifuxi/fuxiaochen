import { CmsShell } from "@/components/layout/cms-shell";
import { commentRows } from "@/lib/mocks/cms-content";

export default function CmsCommentsPage() {
  return (
    <CmsShell description="Review, approve, or remove community discussion with clear moderation states." title="Comments">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {["All", "Pending", "Approved", "Spam"].map((tab, index) => (
          <button key={tab} className={index === 0 ? "rounded-xl bg-primary px-4 py-2 text-sm text-black" : `
            rounded-xl bg-white/6 px-4 py-2 text-sm text-muted transition
            hover:text-foreground
          `}>
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {commentRows.map((comment, index) => (
          <div key={`${comment.author}-${index}`} className={`
            glass-card rounded-2xl border p-6
            ${comment.status === "Approved" ? "border-l-4 border-white/8 border-l-primary" : comment.status === "Pending" ? `
              border-l-4 border-white/8 border-l-amber-400
            ` : `border-l-4 border-white/8 border-l-red-500`}
          `}>
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`
                  flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white
                  ${index % 2 === 0 ? `bg-primary/70` : `bg-sky-500/70`}
                `}>
                  {comment.author.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{comment.author}</div>
                  <div className="text-xs text-muted">{comment.author.toLowerCase()}@example.com</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`
                  rounded-full px-3 py-1 text-xs
                  ${comment.status === "Approved" ? `bg-primary/15 text-primary` : comment.status === "Pending" ? `
                    bg-amber-500/15 text-amber-400
                  ` : `bg-red-500/15 text-red-400`}
                `}>
                  {comment.status}
                </span>
                <span className="text-xs text-muted">2h ago</span>
              </div>
            </div>

            <div className="pl-[52px]">
              <div className={`
                mb-4 inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1 text-xs text-primary
              `}>
                <span>↳</span>
                <span>{comment.article}</span>
              </div>
              <p className="mb-4 text-sm leading-7 text-foreground">{comment.content}</p>
            </div>

            <div className="flex gap-2 pl-[52px]">
              <button className="rounded-lg bg-primary/15 px-3 py-1 text-xs text-primary">Approve</button>
              <button className="rounded-lg border border-white/8 bg-white/4 px-3 py-1 text-xs text-foreground">Reply</button>
              <button className={`
                rounded-lg border border-white/8 bg-white/4 px-3 py-1 text-xs text-foreground
                hover:border-red-500 hover:text-red-400
              `}>Spam</button>
              <button className={`
                rounded-lg border border-white/8 bg-white/4 px-3 py-1 text-xs text-foreground
                hover:border-red-500 hover:text-red-400
              `}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </CmsShell>
  );
}
