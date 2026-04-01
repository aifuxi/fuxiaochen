const colorSwatches = [
  ["Background", "#050505"],
  ["Primary", "#10b981"],
  ["Foreground", "#ebebeb"],
  ["Muted", "rgba(255,255,255,0.4)"],
] as const;

const semanticSwatches = [
  ["Success", "#10b981"],
  ["Warning", "#f59e0b"],
  ["Destructive", "#ef4444"],
  ["Info", "#3b82f6"],
] as const;

const neutralSwatches = [
  ["Card", "rgba(255,255,255,0.02)"],
  ["Secondary", "rgba(255,255,255,0.08)"],
  ["Border", "rgba(255,255,255,0.08)"],
  ["Input", "rgba(255,255,255,0.15)"],
] as const;

export default function Page() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="flex">
        <aside className={`
          sticky top-0 hidden h-screen w-[260px] shrink-0 overflow-y-auto border-r border-white/10 bg-bg px-6 py-8
          lg:block
        `}>
          <div className="mb-10">
            <div className="mb-4 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
              Design System
            </div>
            <div className="font-serif text-3xl font-semibold tracking-[-0.04em] text-primary">
              Chen Serif
            </div>
          </div>
          <nav className="space-y-2">
            {[
              ["#colors", "色彩系统"],
              ["#typography", "字体系统"],
              ["#components", "组件库"],
              ["#table", "数据表格"],
              ["#pagination", "分页"],
              ["#modal", "模态框"],
              ["#animation", "动画规范"],
              ["#effects", "特效组件"],
            ].map(([href, label], index) => (
              <a
                key={href}
                href={href}
                className={`
                  flex items-center rounded-xl px-4 py-3 text-sm transition-colors
                  ${
                  index === 0 ? "bg-primary/10 text-primary" : `
                    text-muted
                    hover:bg-white/5 hover:text-fg
                  `
                }
                `}
              >
                {label}
              </a>
            ))}
          </nav>
        </aside>

        <main className={`
          min-w-0 flex-1 px-6 py-10
          lg:px-10
        `}>
          <div className="mx-auto max-w-6xl space-y-12">
            <section className="py-6 text-center">
              <div className={`
                mb-5 inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-primary uppercase
              `}>
                <span className="size-2 rounded-full bg-primary" />
                Design System v1.0
              </div>
              <h1 className="font-serif text-[clamp(4rem,8vw,6.25rem)] leading-[0.9] font-medium tracking-[-0.06em]">
                Chen <span className="text-primary italic">Serif</span>
              </h1>
              <p className="mx-auto mt-5 max-w-3xl text-lg leading-9 text-muted">
                一个深色模式设计系统，将 Newsreader 的阅读感、Space Grotesk 的技术感和
                Inter 的界面稳定性组合在一起。
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button type="button" className={`
                  rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-fg transition-colors
                  hover:bg-primary-h
                `}>
                  下载资源
                </button>
                <button type="button" className={`
                  rounded-full border border-white/10 px-6 py-3 text-sm text-fg transition-colors
                  hover:bg-white/5
                `}>
                  阅读文档
                </button>
              </div>
            </section>

            <section id="colors" className="space-y-6">
              <div>
                <h2
                  className="font-serif font-medium tracking-[-0.05em] text-fg"
                  style={{ fontSize: "var(--text-h2)" }}
                >
                  色彩系统
                </h2>
                <p className="mt-2 text-base leading-8 text-muted">
                  以翡翠绿为主强调色的深色系设计语言，重点强化层级、边框和弱文本控制。
                </p>
              </div>
              <div className={`
                grid gap-6
                xl:grid-cols-3
              `}>
                <ColorGroup title="主色调 / Primary" swatches={colorSwatches} />
                <ColorGroup title="语义色 / Semantic" swatches={semanticSwatches} />
                <ColorGroup title="中性色 / Neutral" swatches={neutralSwatches} />
              </div>
            </section>

            <section id="typography" className="space-y-6">
              <div>
                <h2
                  className="font-serif font-medium tracking-[-0.05em] text-fg"
                  style={{ fontSize: "var(--text-h2)" }}
                >
                  字体系统
                </h2>
                <p className="mt-2 text-base leading-8 text-muted">
                  Newsreader 用于标题，Space Grotesk 用于技术性标签，Inter 作为正文和 UI 主体。
                </p>
              </div>
              <div className={`
                grid gap-6
                xl:grid-cols-3
              `}>
                <div className="rounded-[1.5rem] border border-white/10 bg-card p-6">
                  <div className="mb-3 font-mono text-[11px] tracking-[0.18em] text-muted uppercase">Headlines</div>
                  <div className="font-serif text-4xl">Newsreader</div>
                  <div className="mt-2 text-sm text-muted">用于标题和强调文字</div>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-card p-6">
                  <div className="mb-3 font-mono text-[11px] tracking-[0.18em] text-muted uppercase">Technical</div>
                  <div className="font-mono text-4xl">Space Grotesk</div>
                  <div className="mt-2 text-sm text-muted">用于标签、数字和微文案</div>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-card p-6">
                  <div className="mb-3 font-mono text-[11px] tracking-[0.18em] text-muted uppercase">Body</div>
                  <div className="text-4xl">Inter</div>
                  <div className="mt-2 text-sm text-muted">用于正文内容和表单界面</div>
                </div>
              </div>
            </section>

            <section id="components" className="space-y-6">
              <div>
                <h2
                  className="font-serif font-medium tracking-[-0.05em] text-fg"
                  style={{ fontSize: "var(--text-h2)" }}
                >
                  组件库
                </h2>
                <p className="mt-2 text-base leading-8 text-muted">按钮、输入框、卡片和表单控件以 variant 驱动。</p>
              </div>
              <div className={`
                grid gap-6
                xl:grid-cols-2
              `}>
                <div className="rounded-[1.5rem] border border-white/10 bg-card p-6">
                  <div className="mb-4 font-mono text-[11px] tracking-[0.18em] text-muted uppercase">Buttons</div>
                  <div className="flex flex-wrap gap-3">
                    <button type="button" className={`
                      rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-fg
                    `}>Primary</button>
                    <button type="button" className={`
                      rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm text-fg
                    `}>Secondary</button>
                    <button type="button" className="rounded-md border border-white/10 px-4 py-2 text-sm text-fg">Outline</button>
                    <button type="button" className="rounded-md px-4 py-2 text-sm text-muted">Ghost</button>
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-card p-6">
                  <div className="mb-4 font-mono text-[11px] tracking-[0.18em] text-muted uppercase">Inputs</div>
                  <div className="space-y-3">
                    <input className={`
                      h-11 w-full rounded-md border border-white/10 bg-white/5 px-4 text-sm text-fg outline-none
                    `} placeholder="Text input" />
                    <input className={`
                      h-11 w-full rounded-md border border-primary/40 bg-white/5 px-4 text-sm text-fg outline-none
                    `} placeholder="Focused input" />
                  </div>
                </div>
              </div>
            </section>

            <section id="table" className="space-y-6">
              <div>
                <h2
                  className="font-serif font-medium tracking-[-0.05em] text-fg"
                  style={{ fontSize: "var(--text-h2)" }}
                >
                  数据表格
                </h2>
              </div>
              <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-card">
                <div className={`
                  grid grid-cols-[1.7fr_1fr_1fr_0.8fr] border-b border-white/10 px-6 py-4 font-mono text-[11px]
                  tracking-[0.16em] text-muted uppercase
                `}>
                  <span>Article</span>
                  <span>Category</span>
                  <span>Date</span>
                  <span>Status</span>
                </div>
                {[
                  ["Building a Scalable Design System", "Design Systems", "2024-12-15", "Published"],
                  ["Designing Editorial Interfaces", "Editorial UI", "2024-11-28", "Draft"],
                ].map((row) => (
                  <div key={row[0]} className={`
                    grid grid-cols-[1.7fr_1fr_1fr_0.8fr] items-center border-b border-white/8 px-6 py-4 text-sm
                    last:border-b-0
                  `}>
                    <span className="text-fg">{row[0]}</span>
                    <span className="text-muted">{row[1]}</span>
                    <span className="text-muted">{row[2]}</span>
                    <span className="inline-flex w-fit rounded-full bg-primary/12 px-3 py-1 text-xs text-primary">{row[3]}</span>
                  </div>
                ))}
              </div>
            </section>

            <section id="pagination" className="space-y-6">
              <div>
                <h2
                  className="font-serif font-medium tracking-[-0.05em] text-fg"
                  style={{ fontSize: "var(--text-h2)" }}
                >
                  分页
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" className="rounded-md border border-white/10 px-4 py-2 text-sm text-muted">Prev</button>
                {[1, 2, 3].map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`
                      size-10 rounded-md text-sm
                      ${page === 1 ? "bg-primary text-primary-fg" : `border border-white/10 text-muted`}
                    `}
                  >
                    {page}
                  </button>
                ))}
                <button type="button" className="rounded-md border border-white/10 px-4 py-2 text-sm text-muted">Next</button>
              </div>
            </section>

            <section id="modal" className="space-y-6">
              <div>
                <h2
                  className="font-serif font-medium tracking-[-0.05em] text-fg"
                  style={{ fontSize: "var(--text-h2)" }}
                >
                  模态框
                </h2>
              </div>
              <div className="max-w-xl rounded-[1.5rem] border border-white/10 bg-card p-6">
                <div className="mb-2 text-lg font-semibold text-fg">Delete Article</div>
                <p className="mb-5 text-sm leading-7 text-muted">
                  Dialog、Drawer、Alert 统一由 NiceModal 管理，不暴露页面级 `open` 状态。
                </p>
                <div className="flex gap-3">
                  <button type="button" className="rounded-md border border-white/10 px-4 py-2 text-sm text-muted">Cancel</button>
                  <button type="button" className="rounded-md bg-error px-4 py-2 text-sm text-white">Delete</button>
                </div>
              </div>
            </section>

            <section id="animation" className="space-y-6">
              <div>
                <h2
                  className="font-serif font-medium tracking-[-0.05em] text-fg"
                  style={{ fontSize: "var(--text-h2)" }}
                >
                  动画规范
                </h2>
              </div>
              <div className={`
                grid gap-6
                xl:grid-cols-3
              `}>
                {[
                  ["Reveal", "首屏和区块进入使用轻微 blur + translateY。"],
                  ["Hover", "仅允许细小 lift、spotlight、border glow。"],
                  ["CMS", "后台动效短、轻、快，不抢占信息层级。"],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-[1.5rem] border border-white/10 bg-card p-6">
                    <div className="mb-2 text-lg font-semibold text-fg">{title}</div>
                    <p className="text-sm leading-7 text-muted">{text}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="effects" className="space-y-6">
              <div>
                <h2
                  className="font-serif font-medium tracking-[-0.05em] text-fg"
                  style={{ fontSize: "var(--text-h2)" }}
                >
                  特效组件
                </h2>
              </div>
              <div className={`
                grid gap-6
                xl:grid-cols-3
              `}>
                <div className="rounded-[1.5rem] border border-white/10 bg-card p-6">
                  <div className="mb-4 text-lg font-semibold text-fg">Morphing Blob</div>
                  <div className="relative h-32 overflow-hidden rounded-[1rem] bg-black/20">
                    <div className={`
                      absolute top-1/2 left-1/2 size-36 -translate-x-1/2 -translate-y-1/2
                      animate-[morph-blob_8s_ease-in-out_infinite] rounded-[40%_60%_60%_40%_/_60%_40%_60%_40%]
                      bg-primary/15 blur-2xl
                    `} />
                  </div>
                </div>
                <div className="spotlight-card rounded-[1.5rem] border border-white/10 bg-card p-6">
                  <div className="mb-4 text-lg font-semibold text-fg">Spotlight Card</div>
                  <p className="text-sm leading-7 text-muted">Hover 时以鼠标中心产生柔和的 radial glow。</p>
                </div>
                <div className="shimmer-border rounded-[1.5rem] border border-white/10 bg-card p-6">
                  <div className="mb-4 text-lg font-semibold text-fg">Shimmer Border</div>
                  <p className="text-sm leading-7 text-muted">用于强调可交互卡片边缘，不持续抢占注意力。</p>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function ColorGroup({
  title,
  swatches,
}: {
  title: string;
  swatches: readonly (readonly [string, string])[];
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-card p-6">
      <div className="mb-5 font-mono text-[11px] tracking-[0.18em] text-muted uppercase">{title}</div>
      <div className="grid gap-4">
        {swatches.map(([label, value]) => (
          <div
            key={label}
            className="rounded-[1rem] p-4"
            style={{ background: value, border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div className={`
              ${value === "#050505" || value === "#3b82f6" || value === "#ef4444" ? "text-white" : `text-black`}
              text-sm font-medium
            `}>
              {label}
            </div>
            <div className={`
              ${value === "#050505" || value === "#3b82f6" || value === "#ef4444" ? "text-white/70" : `text-black/70`}
              mt-1 text-xs
            `}>
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
