export function AboutMe() {
  return (
    <div className="glass-panel relative h-full overflow-hidden rounded-2xl border border-neon-magenta/30 p-8">
      <div
        className={`
          absolute top-0 right-0 h-32 w-32 translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-magenta/20 blur-3xl
        `}
      />

      <div className="relative z-10">
        <h2 className="mb-8 text-3xl font-bold text-neon-magenta">
          关于操作员 / About_Operator
        </h2>
        <div
          className={`
            flex flex-col items-start gap-8
            md:flex-row
          `}
        >
          <div
            className={`
              h-24 w-24 shrink-0 rounded-full border-2 border-neon-magenta p-1
              shadow-[0_0_20px_var(--color-neon-magenta)]
            `}
          >
            <div
              className={`
                relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-gray-800
              `}
            >
              <span className="text-2xl">👨‍💻</span>
              <div
                className={`
                  absolute inset-0 bg-gradient-to-tr from-neon-purple to-neon-cyan opacity-30 mix-blend-overlay
                `}
              />
            </div>
          </div>
          <div className="space-y-6">
            <p className="leading-relaxed font-light text-gray-300">
              全栈开发人员，沉迷于未来感界面和数字体验。
              在现实与赛博朋克未来之间架起桥梁。专注于 React、Next.js 和沉浸式
              UI/UX。
            </p>
            <div className="flex gap-8 border-t border-white/10 pt-6">
              <div className="flex flex-col">
                <span className="font-mono text-3xl font-bold text-white">
                  05+
                </span>
                <span className="mt-1 text-[10px] tracking-widest text-gray-500 uppercase">
                  年经验 / Years Exp
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-3xl font-bold text-white">
                  20+
                </span>
                <span className="mt-1 text-[10px] tracking-widest text-gray-500 uppercase">
                  项目 / Projects
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
