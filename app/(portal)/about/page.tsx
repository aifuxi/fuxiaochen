import { GlassCard } from "@/components/ui/glass-card";
import Link from "next/link";
import { Github, Mail, MapPin, Briefcase, Zap, Laptop, Coffee } from "lucide-react";
import { BILIBILI_PAGE, EMAIL, GITHUB_PAGE } from "@/constants/info";

export default function AboutPage() {
  const socialLinks = [
    { icon: Github, href: GITHUB_PAGE, label: "GitHub" },
    {
      icon: (props: any) => (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.892 0 17.382V9.987c.036-1.51.556-2.769 1.56-3.773S3.822 4.7 5.333 4.653h.854L3.625 2.05a1.12 1.12 0 0 1-.036-.089 1.06 1.06 0 0 1-.013-.151c.01-.223.093-.42.249-.591.155-.171.353-.257.595-.258.242.001.442.087.6.258l3.12 3.111h7.72l3.12-3.111c.158-.171.358-.257.6-.258.242-.001.44.085.595.258.156.171.238.368.249.591a.7.7 0 0 1-.013.151 1.7 1.7 0 0 1-.036.089L17.813 4.653Zm-9.827 10.32c.94 0 1.705-.304 2.296-.91.59-.607.886-1.34.888-2.198v-.054a3.1 3.1 0 0 0-.897-2.215 3.03 3.03 0 0 0-2.269-.91c-.947 0-1.716.304-2.305.91-.588.605-.883 1.343-.883 2.215v.054c0 .852.292 1.581.875 2.188.583.606 1.35.91 2.296.92Zm7.982 0c.947 0 1.716-.304 2.305-.91.589-.607.883-1.34.883-2.198v-.054a3.1 3.1 0 0 0-.883-2.215 3.03 3.03 0 0 0-2.287-.91c-.933 0-1.696.304-2.287.91-.59.605-.886 1.343-.888 2.215v.054c0 .852.295 1.581.883 2.188.588.606 1.35.91 2.287.92Z" />
        </svg>
      ),
      href: BILIBILI_PAGE,
      label: "Bilibili",
    },
    { icon: Mail, href: `mailto:${EMAIL}`, label: "Email" },
  ];

  const techStack = {
    frontend: [
      { name: "React", icon: "icon-[skill-icons--react-dark]" },
      { name: "Next.js", icon: "icon-[skill-icons--nextjs-dark]" },
      { name: "TypeScript", icon: "icon-[skill-icons--typescript]" },
      { name: "Tailwind", icon: "icon-[skill-icons--tailwindcss-dark]" },
    ],
    backend: [
      { name: "Go", icon: "icon-[skill-icons--golang]" },
      { name: "MySQL", icon: "icon-[skill-icons--mysql-dark]" },
      { name: "Docker", icon: "icon-[skill-icons--docker]" },
    ],
  };

  const gear = [
    { name: "MacBook Pro M3 Max", category: "工作站" },
    { name: "KIZI K75", category: "键盘" },
    { name: "罗技 GPW 二代", category: "鼠标" },
    { name: "LG UltraFine 4K HDR400", category: "显示器" },
  ];

  // Calculate experience accurately
  const startYear = 2020;
  const currentYear = new Date().getFullYear();
  const expYears = currentYear - startYear;

  return (
    <div className="min-h-screen bg-[var(--bg-color)] px-4 pt-32 pb-20">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className={`
            text-4xl font-bold tracking-tight text-[var(--text-color)]
            md:text-6xl
          `}>
            关于我
          </h1>
          <p className="max-w-xl text-lg text-[var(--text-color-secondary)]">
            构建数字产品，探索技术边界，偶尔写写代码。
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className={`
          grid grid-cols-1 gap-4
          md:grid-cols-3 md:grid-rows-2
          lg:gap-6
        `}>
          {/* 1. Profile Card (Large, Span 2) */}
          <GlassCard className={`
            relative flex flex-col justify-between overflow-hidden p-8
            md:col-span-2 md:row-span-2
          `}>
             <div className={`
               absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-[var(--accent-color)]/20 blur-[100px]
             `} />

            <div className="relative z-10 space-y-6">
              <div className="flex items-start justify-between">
                <div className={`
                  flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent-color)]
                  to-purple-600 text-4xl shadow-lg
                `}>
                  🧑‍💻
                </div>
                <div className="flex gap-3">
                  {socialLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      className={`
                        flex h-10 w-10 items-center justify-center rounded-full border border-[var(--glass-border)]
                        bg-[var(--glass-bg)] text-[var(--text-color-secondary)] transition-all
                        hover:scale-110 hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]
                      `}
                    >
                      <link.icon className="h-5 w-5" />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h2 className={`
                  text-2xl font-bold text-[var(--text-color)]
                  md:text-4xl
                `}>
                  付小晨 (Fu Xiaochen)
                </h2>
                <div className="flex flex-wrap gap-3 text-sm font-medium text-[var(--text-color-secondary)]">
                   <span className="flex items-center gap-1.5 rounded-full bg-[var(--glass-border)]/50 px-3 py-1">
                    <Briefcase className="h-4 w-4" />
                    Frontend Engineer
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-[var(--glass-border)]/50 px-3 py-1">
                    <MapPin className="h-4 w-4" />
                    Shanghai, China
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-[var(--glass-border)]/50 px-3 py-1">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Available for freelance
                  </span>
                </div>
                <p className={`
                  text-base leading-relaxed text-[var(--text-color-secondary)]
                  md:text-lg
                `}>
                  我是一名专注于用户体验的前端工程师。从 {startYear} 年开始，我一直致力于构建美观、高性能的 Web 应用。
                  热衷于开源社区，喜欢折腾各种新奇的技术栈。在代码之外，这里也是我记录生活和思考的地方。
                </p>
              </div>
            </div>
          </GlassCard>

          {/* 2. Stats Card (Small) */}
          <GlassCard className={`
            flex flex-col justify-center rounded-2xl p-6
            md:col-span-1
          `}>
             <div className="flex items-center gap-4">
               <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                 <Briefcase className="h-6 w-6" />
               </div>
               <div>
                 <div className="text-3xl font-bold text-[var(--text-color)]">{expYears}+</div>
                 <div className="text-sm text-[var(--text-color-secondary)]">从业年限</div>
               </div>
             </div>
          </GlassCard>

          {/* 3. Status/Coffee Card (Small) */}
          <GlassCard className={`
            flex flex-col justify-center rounded-2xl p-6
            md:col-span-1
          `}>
            <div className="flex items-center gap-4">
               <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
                 <Coffee className="h-6 w-6" />
               </div>
               <div>
                 <div className="text-3xl font-bold text-[var(--text-color)]">∞</div>
                 <div className="text-sm text-[var(--text-color-secondary)]">咖啡消耗</div>
               </div>
             </div>
          </GlassCard>

           {/* 4. Tech Stack (Wide) */}
           <GlassCard className={`
             rounded-2xl p-6
             md:col-span-3
           `}>
             <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-[var(--text-color)]">
               <Laptop className="h-5 w-5 text-[var(--accent-color)]" />
               技术栈
             </h3>
             <div className={`
               grid grid-cols-1 gap-8
               md:grid-cols-2
             `}>
               <div>
                  <h4 className="mb-3 text-xs font-semibold tracking-wider text-[var(--text-color-secondary)] uppercase">前端技术</h4>
                  <div className="flex flex-wrap gap-2">
                    {techStack.frontend.map((tech) => (
                      <div key={tech.name} className={`
                        flex items-center gap-2 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)]/50
                        px-3 py-2 transition-colors
                        hover:bg-[var(--glass-border)]
                      `}>
                        <span className={`
                          ${tech.icon}
                          h-5 w-5
                        `} />
                        <span className="text-sm font-medium text-[var(--text-color)]">{tech.name}</span>
                      </div>
                    ))}
                  </div>
               </div>
                <div>
                  <h4 className="mb-3 text-xs font-semibold tracking-wider text-[var(--text-color-secondary)] uppercase">后端 & 运维</h4>
                  <div className="flex flex-wrap gap-2">
                    {techStack.backend.map((tech) => (
                      <div key={tech.name} className={`
                        flex items-center gap-2 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)]/50
                        px-3 py-2 transition-colors
                        hover:bg-[var(--glass-border)]
                      `}>
                        <span className={`
                          ${tech.icon}
                          h-5 w-5
                        `} />
                        <span className="text-sm font-medium text-[var(--text-color)]">{tech.name}</span>
                      </div>
                    ))}
                  </div>
               </div>
             </div>
           </GlassCard>

           {/* 5. Gear List (Wide) */}
           <GlassCard className={`
             rounded-2xl p-6
             md:col-span-3
           `}>
             <div className={`
               flex flex-col gap-6
               md:flex-row md:items-center md:justify-between
             `}>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-color)]">装备清单</h3>
                  <p className="text-sm text-[var(--text-color-secondary)]">工欲善其事，必先利其器</p>
                </div>
                <div className={`
                  grid grid-cols-1 gap-3
                  sm:grid-cols-2
                  md:flex md:flex-wrap
                `}>
                  {gear.map((item) => (
                    <div key={item.name} className={`
                      group relative flex items-center gap-3 overflow-hidden rounded-2xl border
                      border-[var(--glass-border)] bg-[var(--glass-bg)]/30 px-4 py-2 transition-all
                      hover:bg-[var(--glass-border)]
                    `}>
                      <div className={`
                        absolute top-0 left-0 h-full w-0.5 bg-[var(--accent-color)] opacity-0 transition-opacity
                        group-hover:opacity-100
                      `} />
                      <div className="flex flex-col">
                        <span className="text-xs text-[var(--text-color-secondary)]">{item.category}</span>
                        <span className="text-sm font-medium text-[var(--text-color)]">{item.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
           </GlassCard>

        </div>
      </div>
    </div>
  );
}
