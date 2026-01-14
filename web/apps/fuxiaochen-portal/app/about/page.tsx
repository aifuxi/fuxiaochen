import Link from "next/link";

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
    <div className="min-h-screen bg-cyber-black text-white font-body selection:bg-neon-magenta selection:text-black">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[100] pointer-events-none bg-[length:100%_2px,3px_100%] animate-scanline" />

      <main className="pt-32 pb-20 max-w-5xl mx-auto px-4">
        {/* Profile Section */}
        <section className="mb-20">
          <div className="glass-panel p-8 md:p-12 rounded-3xl border border-neon-cyan/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-neon-cyan/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-neon-cyan/20 transition-all duration-500" />

            <div className="flex flex-col md:flex-row gap-10 items-center md:items-start relative z-10">
              {/* Avatar Placeholder */}
              <div className="relative shrink-0">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-neon-cyan p-1 shadow-[0_0_20px_var(--color-neon-cyan)] relative z-10 bg-cyber-black flex items-center justify-center overflow-hidden">
                  <span className="text-4xl">👨‍💻</span>
                  <div className="absolute inset-0 bg-gradient-to-tr from-neon-purple to-neon-cyan opacity-30 mix-blend-overlay" />
                </div>
                {/* Decorative circles */}
                <div className="absolute inset-0 border border-neon-cyan/30 rounded-full scale-125 animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-0 border border-dashed border-neon-purple/30 rounded-full scale-150 animate-[spin_15s_linear_infinite_reverse]" />
              </div>

              <div className="text-center md:text-left space-y-4">
                <div className="space-y-1">
                  <h1
                    className="text-4xl md:text-6xl font-bold font-display uppercase tracking-wider text-white glitch-text"
                    data-text="Fu_Xiaochen"
                  >
                    Fu_Xiaochen
                  </h1>
                  <p className="text-neon-cyan font-mono text-lg tracking-widest">
                    /// FRONTEND_ENGINEER_CLASS
                  </p>
                </div>

                <p className="text-gray-300 max-w-2xl leading-relaxed text-lg">
                  Frontend developer since 2020. Enthusiast of{" "}
                  <span className="text-neon-cyan">React</span>,{" "}
                  <span className="text-neon-cyan">Go</span>, and{" "}
                  <span className="text-neon-cyan">TypeScript</span>. Passionate
                  about coding, gaming, and building immersive digital
                  experiences.
                </p>

                <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
                  <div className="px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/30 rounded text-neon-cyan font-mono text-sm">
                    EXP: 4+ YEARS
                  </div>
                  <div className="px-4 py-2 bg-neon-purple/10 border border-neon-purple/30 rounded text-neon-purple font-mono text-sm">
                    LOC: SHENZHEN
                  </div>
                  <div className="px-4 py-2 bg-neon-magenta/10 border border-neon-magenta/30 rounded text-neon-magenta font-mono text-sm">
                    STATUS: ONLINE
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Skills Matrix */}
          <section className="glass-panel p-8 rounded-2xl border border-neon-purple/20">
            <h3 className="text-2xl font-bold text-neon-purple mb-8 flex items-center gap-3">
              <span className="text-xl">⚡</span> NEURAL_IMPLANTS (Skills)
            </h3>

            <div className="space-y-8">
              <div>
                <h4 className="text-sm font-mono text-gray-500 mb-3 uppercase tracking-wider">
                  Frontend_Modules
                </h4>
                <div className="flex flex-wrap gap-2">
                  {frontendSkills.map((skill) => (
                    <span
                      key={skill.name}
                      className="px-3 py-1 bg-cyber-black border border-neon-purple/30 rounded text-gray-300 text-sm hover:border-neon-purple hover:text-neon-purple hover:shadow-[0_0_10px_var(--color-neon-purple)] transition-all duration-300 cursor-default flex items-center gap-2"
                    >
                      <span className={`${skill.icon} w-4 h-4`} />
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-mono text-gray-500 mb-3 uppercase tracking-wider">
                  Backend_Protocols
                </h4>
                <div className="flex flex-wrap gap-2">
                  {backendSkills.map((skill) => (
                    <span
                      key={skill.name}
                      className="px-3 py-1 bg-cyber-black border border-neon-cyan/30 rounded text-gray-300 text-sm hover:border-neon-cyan hover:text-neon-cyan hover:shadow-[0_0_10px_var(--color-neon-cyan)] transition-all duration-300 cursor-default flex items-center gap-2"
                    >
                      <span className={`${skill.icon} w-4 h-4`} />
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-mono text-gray-500 mb-3 uppercase tracking-wider">
                  System_Tools
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {systemTools.map((tool, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-gray-400"
                    >
                      <span className={`${tool.icon} w-4 h-4`} />
                      {tool.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Equipment */}
          <section className="glass-panel p-8 rounded-2xl border border-neon-magenta/20">
            <h3 className="text-2xl font-bold text-neon-magenta mb-8 flex items-center gap-3">
              <span className="text-xl">🖥️</span> HARDWARE_LOADOUT
            </h3>

            <div className="space-y-6 relative">
              {/* Connector Line */}
              <div className="absolute left-[19px] top-4 bottom-4 w-px bg-neon-magenta/20" />

              {[
                {
                  label: "Mainframe",
                  value: "MacBook Pro 14-inch M3 Max",
                  icon: "💻",
                },
                { label: "Combat_Unit", value: "MSI GP76 RTX3070", icon: "🎮" },
                {
                  label: "Visual_Interface",
                  value: 'LG 27" 4K Display',
                  icon: "👁️",
                },
                {
                  label: "Input_Matrix_A",
                  value: "KIZI K75 Keyboard",
                  icon: "⌨️",
                },
                {
                  label: "Input_Matrix_B",
                  value: "Logitech G PRO 2 Mouse",
                  icon: "🖱️",
                },
              ].map((item, i) => (
                <div key={i} className="relative pl-12 group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-cyber-black border-2 border-neon-magenta group-hover:bg-neon-magenta transition-colors duration-300 z-10" />

                  <div className="bg-cyber-black/50 p-4 rounded-xl border border-white/5 group-hover:border-neon-magenta/50 transition-all duration-300">
                    <div className="text-xs font-mono text-neon-magenta uppercase tracking-wider mb-1 opacity-70">
                      {item.label}
                    </div>
                    <div className="text-gray-200 font-medium flex items-center gap-2">
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
          <p className="text-gray-500 font-mono text-sm">
            /// END_OF_FILE: PROFILE_DATA
          </p>
        </div>
      </main>
    </div>
  );
}
