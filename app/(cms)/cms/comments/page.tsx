import { CmsShell } from "@/components/layouts/cms-shell";
import { comments } from "@/lib/mock/design-content";

export default function CmsCommentsPage() {
  return (
    <CmsShell
      currentPath="/cms/comments"
      description="Moderation surfaces belong in the CMS domain and should not reuse public page composition."
      title="Comments"
    >
      <section className="space-y-6">
        <div className="cms-card p-5">
          <div className="flex flex-wrap gap-3">
            <button type="button" className="rounded-md bg-primary px-4 py-2 text-sm text-primary-fg">
              All comments
            </button>
            <button type="button" className="rounded-md border border-border px-4 py-2 text-sm text-muted">
              Pending
            </button>
            <button type="button" className="rounded-md border border-border px-4 py-2 text-sm text-muted">
              Approved
            </button>
            <button type="button" className="rounded-md border border-border px-4 py-2 text-sm text-muted">
              Spam
            </button>
          </div>
        </div>
        <div className="space-y-4">
          {comments.map((comment) => (
            <article
              key={`${comment.author}-${comment.time}`}
              className={`
                cms-card p-5
                ${
                comment.status === "approved"
                  ? "border-l-[3px] border-l-primary"
                  : comment.status === "pending"
                    ? "border-l-[3px] border-l-warning"
                    : "border-l-[3px] border-l-error"
              }
              `}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`
                    flex size-10 items-center justify-center rounded-full bg-primary text-sm font-semibold
                    text-primary-fg
                  `}>
                    {comment.author.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-fg">{comment.author}</div>
                    <div className="text-xs text-muted">{comment.email}</div>
                  </div>
                </div>
                <span
                  className={`
                    rounded-full px-3 py-1 font-mono text-[11px] tracking-[0.16em] uppercase
                    ${
                    comment.status === "approved"
                      ? "bg-primary/12 text-primary"
                      : comment.status === "pending"
                        ? "bg-warning/12 text-warning"
                        : "bg-error/12 text-error"
                  }
                  `}
                >
                  {comment.status}
                </span>
              </div>
              <div className="mt-4 inline-flex rounded-md bg-primary/10 px-3 py-1 text-xs text-primary">
                {comment.article}
              </div>
              <p className="mt-4 text-sm leading-8 text-fg">{comment.content}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="text-xs text-muted">{comment.time}</span>
                <button type="button" className="rounded-md bg-primary/12 px-3 py-1.5 text-xs text-primary">
                  Approve
                </button>
                <button type="button" className="rounded-md border border-border px-3 py-1.5 text-xs text-muted">
                  Reply
                </button>
                <button type="button" className="rounded-md border border-error/30 px-3 py-1.5 text-xs text-error">
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </CmsShell>
  );
}
