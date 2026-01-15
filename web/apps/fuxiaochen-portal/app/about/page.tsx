export default function AboutPage() {
  const frontendSkills = [
    { name: "HTML", icon: "icon-[skill-icons--html]" },
    { name: "CSS", icon: "icon-[skill-icons--css]" },
    { name: "JavaScript", icon: "icon-[skill-icons--javascript]" },
    { name: "TypeScript", icon: "icon-[skill-icons--typescript]" },
    { name: "React", icon: "icon-[skill-icons--react-dark]" },
    { name: "Next.js", icon: "icon-[skill-icons--nextjs-dark]" },
    { name: "ahooks", icon: "icon-[skill-icons--react-dark]" }, // Fallback to React icon
    { name: "Tailwind CSS", icon: "icon-[skill-icons--tailwindcss-dark]" },
  ];

  const backendSkills = [
    { name: "Go", icon: "icon-[skill-icons--golang]" },
    { name: "MySQL (CRUD)", icon: "icon-[skill-icons--mysql-dark]" },
  ];

  const systemTools = [
    { name: "Zsh + Oh My Zsh", icon: "icon-[skill-icons--bash-dark]" },
    { name: "iTerm2 + Nerd Font", icon: "icon-[skill-icons--linux-dark]" },
    { name: "Linux (Debian/CentOS)", icon: "icon-[skill-icons--linux-dark]" },
    { name: "Docker", icon: "icon-[skill-icons--docker]" },
    { name: "NGINX (Proxy/SSL)", icon: "icon-[skill-icons--nginx]" },
    { name: "Figma", icon: "icon-[skill-icons--figma-dark]" },
    { name: "AI Assistance", icon: "icon-[skill-icons--github-dark]" }, // Using GitHub icon for Copilot/AI
  ];

  return (
    <div
      className={`
        min-h-screen bg-cyber-black font-body text-white
        selection:bg-neon-magenta selection:text-black
      `}
    >
      <div
        className={`
          pointer-events-none fixed inset-0 z-[100] animate-scanline
          bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))]
          bg-[length:100%_2px,3px_100%]
        `}
      />

      <main className="mx-auto max-w-5xl px-4 pt-32 pb-20">
        {/* Profile Section */}
        <section className="mb-20">
          <div
            className={`
              glass-panel group relative overflow-hidden rounded-3xl border border-neon-cyan/20 p-8
              md:p-12
            `}
          >
            <div
              className={`
                absolute top-0 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-cyan/10
                blur-[80px] transition-all duration-500
                group-hover:bg-neon-cyan/20
              `}
            />

            <div
              className={`
                relative z-10 flex flex-col items-center gap-10
                md:flex-row md:items-start
              `}
            >
              {/* Avatar Placeholder */}
              <div className="relative shrink-0">
                <div
                  className={`
                    relative z-10 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2
                    border-neon-cyan bg-cyber-black p-1 shadow-[0_0_20px_var(--color-neon-cyan)]
                    md:h-40 md:w-40
                  `}
                >
                  <span className="text-4xl">👨‍💻</span>
                  <div
                    className={`
                      absolute inset-0 bg-gradient-to-tr from-neon-purple to-neon-cyan opacity-30 mix-blend-overlay
                    `}
                  />
                </div>
                {/* Decorative circles */}
                <div
                  className={`
                    absolute inset-0 scale-125 animate-[spin_10s_linear_infinite] rounded-full border
                    border-neon-cyan/30
                  `}
                />
                <div
                  className={`
                    absolute inset-0 scale-150 animate-[spin_15s_linear_infinite_reverse] rounded-full border
                    border-dashed border-neon-purple/30
                  `}
                />
              </div>

              <div
                className={`
                  space-y-4 text-center
                  md:text-left
                `}
              >
                <div className="space-y-1">
                  <h1
                    className={`
                      glitch-text font-display text-4xl font-bold tracking-wider text-white uppercase
                      md:text-6xl
                    `}
                    data-text="付小晨"
                  >
                    付小晨
                  </h1>
                  <p className="font-mono text-lg tracking-widest text-neon-cyan">
                    /// FRONTEND_ENGINEER_CLASS
                  </p>
                </div>

                <p className="max-w-2xl text-lg leading-relaxed text-gray-300">
                  自 2020 年以来的前端开发人员。热衷于{" "}
                  <span className="text-neon-cyan">React</span>,{" "}
                  <span className="text-neon-cyan">Go</span>, 和{" "}
                  <span className="text-neon-cyan">TypeScript</span>
                  。热爱编程、游戏，并致力于构建沉浸式的数字体验。
                </p>

                <div
                  className={`
                    flex flex-wrap justify-center gap-4 pt-4
                    md:justify-start
                  `}
                >
                  <div
                    className={`
                      rounded border border-neon-cyan/30 bg-neon-cyan/10 px-4 py-2 font-mono text-sm text-neon-cyan
                    `}
                  >
                    经验：4+ 年
                  </div>
                  <div
                    className={`
                      rounded border border-neon-purple/30 bg-neon-purple/10 px-4 py-2 font-mono text-sm
                      text-neon-purple
                    `}
                  >
                    位置：上海
                  </div>
                  <div
                    className={`
                      rounded border border-neon-magenta/30 bg-neon-magenta/10 px-4 py-2 font-mono text-sm
                      text-neon-magenta
                    `}
                  >
                    状态：在线
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div
          className={`
            grid grid-cols-1 gap-8
            md:grid-cols-2
          `}
        >
          {/* Skills Matrix */}
          <section className="glass-panel rounded-2xl border border-neon-purple/20 p-8">
            <h3 className="mb-8 flex items-center gap-3 text-2xl font-bold text-neon-purple">
              <span className="text-xl">⚡</span> 神经植入 (技能)
            </h3>

            <div className="space-y-8">
              <div>
                <h4 className="mb-3 font-mono text-sm tracking-wider text-gray-500 uppercase">
                  前端模块 / Frontend_Modules
                </h4>
                <div className="flex flex-wrap gap-2">
                  {frontendSkills.map((skill) => (
                    <span
                      key={skill.name}
                      className={`
                        flex cursor-default items-center gap-2 rounded border border-neon-purple/30 bg-cyber-black px-3
                        py-1 text-sm text-gray-300 transition-all duration-300
                        hover:border-neon-purple hover:text-neon-purple hover:shadow-[0_0_10px_var(--color-neon-purple)]
                      `}
                    >
                      <span
                        className={`
                          ${skill.icon}
                          h-4 w-4
                        `}
                      />
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-3 font-mono text-sm tracking-wider text-gray-500 uppercase">
                  后端协议 / Backend_Protocols
                </h4>
                <div className="flex flex-wrap gap-2">
                  {backendSkills.map((skill) => (
                    <span
                      key={skill.name}
                      className={`
                        flex cursor-default items-center gap-2 rounded border border-neon-cyan/30 bg-cyber-black px-3
                        py-1 text-sm text-gray-300 transition-all duration-300
                        hover:border-neon-cyan hover:text-neon-cyan hover:shadow-[0_0_10px_var(--color-neon-cyan)]
                      `}
                    >
                      <span
                        className={`
                          ${skill.icon}
                          h-4 w-4
                        `}
                      />
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-3 font-mono text-sm tracking-wider text-gray-500 uppercase">
                  系统工具 / System_Tools
                </h4>
                <div
                  className={`
                    grid grid-cols-1 gap-2
                    sm:grid-cols-2
                  `}
                >
                  {systemTools.map((tool, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-gray-400"
                    >
                      <span
                        className={`
                          ${tool.icon}
                          h-4 w-4
                        `}
                      />
                      {tool.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Equipment */}
          <section className="glass-panel rounded-2xl border border-neon-magenta/20 p-8">
            <h3 className="mb-8 flex items-center gap-3 text-2xl font-bold text-neon-magenta">
              <span className="text-xl">🖥️</span> 硬件装备 / HARDWARE_LOADOUT
            </h3>

            <div className="relative space-y-6">
              {/* Connector Line */}
              <div className="absolute top-4 bottom-4 left-[19px] w-px bg-neon-magenta/20" />

              {[
                {
                  label: "主机 / Mainframe",
                  value: "MacBook Pro 14-inch M3 Max",
                  icon: "💻",
                },
                {
                  label: "战斗单元 / Combat_Unit",
                  value: "MSI GP76 RTX3070",
                  icon: "🎮",
                },
                {
                  label: "视觉接口 / Visual_Interface",
                  value: 'LG 27" 4K Display',
                  icon: "👁️",
                },
                {
                  label: "输入矩阵 A / Input_Matrix_A",
                  value: "KIZI K75 Keyboard",
                  icon: "⌨️",
                },
                {
                  label: "输入矩阵 B / Input_Matrix_B",
                  value: "Logitech G PRO 2 Mouse",
                  icon: "🖱️",
                },
              ].map((item, i) => (
                <div key={i} className="group relative pl-12">
                  <div
                    className={`
                      absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-neon-magenta
                      bg-cyber-black transition-colors duration-300
                      group-hover:bg-neon-magenta
                    `}
                  />

                  <div
                    className={`
                      rounded-xl border border-white/5 bg-cyber-black/50 p-4 transition-all duration-300
                      group-hover:border-neon-magenta/50
                    `}
                  >
                    <div className="mb-1 font-mono text-xs tracking-wider text-neon-magenta uppercase opacity-70">
                      {item.label}
                    </div>
                    <div className="flex items-center gap-2 font-medium text-gray-200">
                      {item.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer quote or something */}
        <div className="mt-20 text-center">
          <p className="font-mono text-sm text-gray-500">
            /// END_OF_FILE: PROFILE_DATA 档案结束：个人资料
          </p>
        </div>
      </main>
    </div>
  );
}
