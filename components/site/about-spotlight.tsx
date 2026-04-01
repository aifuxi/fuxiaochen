export function AboutSpotlight() {
  return (
    <section className={`
      grid gap-8 rounded-[2rem] border border-white/10 bg-card p-6 backdrop-blur-xl
      md:grid-cols-[280px_1fr] md:p-8
    `}>
      <div className="relative mx-auto w-full max-w-[280px]">
        <div className={`
          absolute inset-[-4px] animate-[spin_8s_linear_infinite] rounded-full
          bg-[conic-gradient(from_180deg_at_50%_50%,rgb(16_185_129_/_0.75),transparent,rgb(16_185_129_/_0.55))]
          opacity-60 blur-sm
        `} />
        <img
          alt="Alex Chen portrait"
          className="relative aspect-square w-full rounded-full border border-white/10 object-cover"
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=600&fit=crop&crop=face"
        />
      </div>
      <div className="flex flex-col justify-center space-y-5">
        <p className="font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.08] font-medium tracking-[-0.04em] text-fg">
          “我更关心系统如何长期保持秩序，而不是某个页面一时看起来多热闹。”
        </p>
        <p className="editorial-copy max-w-2xl">
          我主要写设计系统、内容产品和前端架构，也做一些偏运营工具与知识系统的实现。喜欢把抽象规则压缩成可复用组件，再把这些组件放回真实产品里检验。
        </p>
      </div>
    </section>
  );
}
