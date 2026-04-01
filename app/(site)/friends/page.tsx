import { FriendCard } from "@/components/site/friend-card";
import { friends } from "@/lib/mock/design-content";

export default function FriendsPage() {
  return (
    <div className={`
      container-shell space-y-10 py-8
      md:py-12
    `}>
      <section className="space-y-5 py-8">
        <div className="flex items-center gap-3">
          <div className="hero-label-dot" />
          <span className="font-mono text-xs tracking-[0.24em] text-primary uppercase">
            Friends
          </span>
        </div>
        <h1 className="font-serif leading-[0.94] font-medium tracking-[-0.05em] text-[var(--text-h1)]">
          People whose work and thinking I keep returning to.
        </h1>
        <p className="max-w-2xl text-lg leading-9 text-muted">
          这个页面包含关系卡片、说明信息块和一个静态提交表单，结构对齐原型但不接任何后端。
        </p>
      </section>

      <section className={`
        grid gap-6
        xl:grid-cols-[1.4fr_0.6fr]
      `}>
        <div className={`
          grid gap-6
          md:grid-cols-2
          xl:grid-cols-3
        `}>
          {friends.map((friend) => (
            <FriendCard key={friend.name} {...friend} />
          ))}
        </div>
        <div className="space-y-6">
          <div className="rounded-[1rem] border border-primary/20 bg-primary/6 p-6">
            <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              +
            </div>
            <h2 className="mb-2 text-lg font-semibold text-fg">Link Exchange</h2>
            <p className="text-sm leading-7 text-muted">
              接受独立博客、作品集和长期维护的知识型站点。偏好有稳定内容沉淀的页面。
            </p>
          </div>
          <form className="rounded-[1rem] border border-white/10 bg-card p-6 backdrop-blur-xl">
            <div className="mb-4 text-lg font-semibold text-fg">Submit Your Site</div>
            <div className="space-y-4">
              <input className={`
                h-12 w-full rounded-[0.75rem] border border-white/10 bg-white/5 px-4 text-sm text-fg outline-none
                placeholder:text-muted
                focus:border-primary
              `} placeholder="Your name" />
              <input className={`
                h-12 w-full rounded-[0.75rem] border border-white/10 bg-white/5 px-4 text-sm text-fg outline-none
                placeholder:text-muted
                focus:border-primary
              `} placeholder="Website URL" />
              <textarea className={`
                min-h-28 w-full rounded-[0.75rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-fg
                outline-none
                placeholder:text-muted
                focus:border-primary
              `} placeholder="Short note..." />
              <button className={`
                h-11 rounded-[0.75rem] bg-primary px-5 font-mono text-xs tracking-[0.16em] text-primary-fg uppercase
                transition-all
                hover:-translate-y-px hover:bg-primary-h
              `} type="submit">
                Send
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
