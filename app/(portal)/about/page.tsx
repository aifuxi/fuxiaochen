import { GlassCard } from "@/components/ui/glass-card";

export default function AboutPage() {
  const frontendSkills = [
    { name: "HTML", icon: "icon-[skill-icons--html]" },
    { name: "CSS", icon: "icon-[skill-icons--css]" },
    { name: "JavaScript", icon: "icon-[skill-icons--javascript]" },
    { name: "TypeScript", icon: "icon-[skill-icons--typescript]" },
    { name: "React", icon: "icon-[skill-icons--react-dark]" },
    { name: "Next.js", icon: "icon-[skill-icons--nextjs-dark]" },
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
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-color)]">
      <main className="mx-auto max-w-5xl px-4 pt-32 pb-20">
        {/* Profile Section */}
        <section className="mb-20">
          <GlassCard className={`
            group relative overflow-hidden rounded-3xl p-8
            md:p-12
          `}>
            {/* Soft Background Gradient */}
            <div className={`
              absolute top-0 right-0 h-96 w-96 translate-x-1/3 -translate-y-1/3 rounded-full bg-[var(--accent-color)]
              opacity-5 blur-[80px]
            `} />

            <div className={`
              relative z-10 flex flex-col items-center gap-10
              md:flex-row md:items-start
            `}>
              {/* Avatar Placeholder */}
              <div className="relative shrink-0">
                <div className={`
                  relative z-10 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4
                  border-white bg-gray-100 shadow-xl
                  md:h-40 md:w-40
                  dark:border-white/10 dark:bg-gray-800
                `}>
                  <span className="text-5xl">👨‍💻</span>
                </div>
              </div>

              <div className={`
                space-y-6 text-center
                md:text-left
              `}>
                <div className="space-y-2">
                  <h1 className={`
                    text-4xl font-bold tracking-tight text-[var(--text-color)]
                    md:text-5xl
                  `}>
                    付小晨
                  </h1>
                  <p className="text-lg font-medium text-[var(--text-color-secondary)]">
                    Frontend Engineer
                  </p>
                </div>

                <p className="max-w-2xl text-lg leading-relaxed text-[var(--text-color-secondary)]">
                  Front-end developer since 2020. Passionate about{" "}
                  <span className="font-semibold text-[var(--accent-color)]">React</span>,
                  <span className="font-semibold text-[var(--accent-color)]"> Go</span>, and{" "}
                  <span className="font-semibold text-[var(--accent-color)]">TypeScript</span>.
                  I love coding, gaming, and building immersive digital experiences.
                </p>

                <div className={`
                  flex flex-wrap justify-center gap-3 pt-2
                  md:justify-start
                `}>
                  <span className={`
                    rounded-full bg-[var(--accent-color)]/10 px-4 py-1.5 text-sm font-medium text-[var(--accent-color)]
                  `}>
                    Exp: 5+ Years
                  </span>
                  <span className={`
                    rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-600
                    dark:bg-blue-900/30 dark:text-blue-400
                  `}>
                    Loc: Shanghai
                  </span>
                  <span className={`
                    rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-green-600
                    dark:bg-green-900/30 dark:text-green-400
                  `}>
                    Status: Online
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </section>

        <div className={`
          grid grid-cols-1 gap-8
          md:grid-cols-2
        `}>
          {/* Skills Matrix */}
          <GlassCard className="p-8">
            <h3 className="mb-8 flex items-center gap-3 text-2xl font-bold text-[var(--text-color)]">
              <span className="text-xl">⚡</span> Tech Stack
            </h3>

            <div className="space-y-8">
              <div>
                <h4 className="mb-3 text-sm font-semibold tracking-wider text-[var(--text-color-secondary)] uppercase">
                  Frontend
                </h4>
                <div className="flex flex-wrap gap-2">
                  {frontendSkills.map((skill) => (
                    <span
                      key={skill.name}
                      className={`
                        flex cursor-default items-center gap-2 rounded-lg border border-[var(--glass-border)]
                        bg-[var(--glass-bg)] px-3 py-1.5 text-sm transition-all
                        hover:bg-gray-100
                        dark:hover:bg-gray-800
                      `}
                    >
                      <span className={`
                        ${skill.icon}
                        h-4 w-4
                      `} />
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-semibold tracking-wider text-[var(--text-color-secondary)] uppercase">
                  Backend
                </h4>
                <div className="flex flex-wrap gap-2">
                  {backendSkills.map((skill) => (
                    <span
                      key={skill.name}
                      className={`
                        flex cursor-default items-center gap-2 rounded-lg border border-[var(--glass-border)]
                        bg-[var(--glass-bg)] px-3 py-1.5 text-sm transition-all
                        hover:bg-gray-100
                        dark:hover:bg-gray-800
                      `}
                    >
                      <span className={`
                        ${skill.icon}
                        h-4 w-4
                      `} />
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-semibold tracking-wider text-[var(--text-color-secondary)] uppercase">
                  Tools
                </h4>
                <div className={`
                  grid grid-cols-1 gap-2
                  sm:grid-cols-2
                `}>
                  {systemTools.map((tool, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-[var(--text-color-secondary)]"
                    >
                      <span className={`
                        ${tool.icon}
                        h-4 w-4
                      `} />
                      {tool.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Equipment */}
          <GlassCard className="p-8">
            <h3 className="mb-8 flex items-center gap-3 text-2xl font-bold text-[var(--text-color)]">
              <span className="text-xl">🖥️</span> Gear & Setup
            </h3>

            <div className="relative space-y-6">
              {/* Connector Line */}
              <div className={`
                absolute top-4 bottom-4 left-[15px] w-px bg-gray-200
                dark:bg-gray-800
              `} />

              {[
                { label: "Workstation", value: "MacBook Pro 14-inch M3 Max", icon: "💻" },
                { label: "Gaming Unit", value: "MSI GP76 RTX3070", icon: "🎮" },
                { label: "Display", value: 'LG 27" 4K Display', icon: "👁️" },
                { label: "Input A", value: "KIZI K75 Keyboard", icon: "⌨️" },
                { label: "Input B", value: "Logitech G PRO 2 Mouse", icon: "🖱️" },
              ].map((item, i) => (
                <div key={i} className="group relative pl-10">
                  <div className={`
                    absolute top-1/2 left-[11px] z-10 h-2 w-2 -translate-y-1/2 rounded-full border-2 border-white
                    bg-[var(--accent-color)]
                    dark:border-gray-900
                  `} />

                  <div className={`
                    rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 transition-all duration-200
                    hover:shadow-md
                  `}>
                    <div className="mb-1 text-xs font-medium text-[var(--text-color-secondary)] uppercase opacity-70">
                      {item.label}
                    </div>
                    <div className="flex items-center gap-2 font-medium text-[var(--text-color)]">
                      {item.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
