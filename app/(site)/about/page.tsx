import { AboutSpotlight } from "@/components/site/about-spotlight";

export default function AboutPage() {
  return (
    <div className={`
      container-shell space-y-10 py-8
      md:py-12
    `}>
      <section className="space-y-5 py-8">
        <div className="flex items-center gap-3">
          <div className="hero-label-dot" />
          <span className="font-mono text-xs tracking-[0.24em] text-primary uppercase">
            About
          </span>
        </div>
        <h1 className="font-serif leading-[0.94] font-medium tracking-[-0.05em] text-[var(--text-h1)]">
          Building editorial systems with a frontend engineer&apos;s precision.
        </h1>
        <p className="max-w-2xl text-lg leading-9 text-muted">
          我喜欢处理那些介于设计与实现之间的工作，把抽象规范变成可以维护、可以迭代、可以落地的产品界面。
        </p>
      </section>

      <AboutSpotlight />

      <section className={`
        grid gap-6
        xl:grid-cols-2
      `}>
        <div className="rounded-[1.5rem] border border-white/10 bg-card p-6 backdrop-blur-xl">
          <div className="mb-4 font-mono text-[11px] tracking-[0.2em] text-primary uppercase">
            Bio
          </div>
          <div className="space-y-4 text-sm leading-8 text-muted">
            <p>
              主要工作在设计系统、内容管理后台、技术文档与前端架构之间。偏好从
              token、组件、布局和页面骨架几层同时考虑问题。
            </p>
            <p>
              我关注的不是“做出一个页面”，而是让这个页面加入系统后仍然清晰、稳定且可扩展。
            </p>
          </div>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-card p-6 backdrop-blur-xl">
          <div className="mb-4 font-mono text-[11px] tracking-[0.2em] text-primary uppercase">
            Principles
          </div>
          <ul className="space-y-3 text-sm leading-8 text-muted">
            <li>Clarity over novelty.</li>
            <li>Variant-driven components over page-local CSS drift.</li>
            <li>Editorial rhythm matters as much as operational density.</li>
            <li>Design specs should be implementable, not ornamental.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
