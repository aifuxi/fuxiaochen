import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Skill data with icons
const allSkills = [
  { name: "HTML", icon: "icon-[skill-icons--html]" },
  { name: "CSS", icon: "icon-[skill-icons--css]" },
  { name: "JavaScript", icon: "icon-[skill-icons--javascript]" },
  { name: "TypeScript", icon: "icon-[skill-icons--typescript]" },
  { name: "React", icon: "icon-[skill-icons--react-dark]" },
  { name: "Next.js", icon: "icon-[skill-icons--nextjs-dark]" },
  { name: "TailwindCSS", icon: "icon-[skill-icons--tailwindcss-dark]" },
  { name: "Go", icon: "icon-[skill-icons--golang]" },
  { name: "MySQL", icon: "icon-[skill-icons--mysql-dark]" },
  { name: "Git", icon: "icon-[skill-icons--git]" },
  { name: "GitHub", icon: "icon-[skill-icons--github-dark]" },
  { name: "Docker", icon: "icon-[skill-icons--docker]" },
  { name: "Linux", icon: "icon-[skill-icons--linux-dark]" },
  { name: "Nginx", icon: "icon-[skill-icons--nginx]" },
  { name: "Figma", icon: "icon-[skill-icons--figma-dark]" },
];

const devices = [
  { name: "MacBook Pro", spec: "14-inch M3 Max 64G", description: "主力机", featured: true },
  { name: "微星 GP76", spec: "RTX 3070", description: "游戏机", featured: true },
  { name: "LG 27 英寸 4K HDR", spec: "", description: "显示器", featured: false },
  { name: "珂芝 K75", spec: "", description: "键盘", featured: false },
  { name: "罗技 PRO 2 代", spec: "", description: "鼠标", featured: false },
];

const skillTags = ["React", "Next.js", "TypeScript", "TailwindCSS", "Go", "MySQL"];

// Hero
function Hero() {
  return (
    <section className={`
      relative px-6 py-20
      md:py-32
    `}>
      {/* Background glow */}
      <div
        className={`
          pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full blur-3xl
        `}
        style={{ background: "var(--primary-glow)" }}
      />

      <div className="relative mx-auto max-w-4xl text-center">
        {/* Eyebrow */}
        <div
          className="mb-4"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.72rem",
            color: "var(--foreground-subtle)",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            animation: "fade-up 0.5s ease forwards",
          }}
        >
          FRONT-END ENGINEER
        </div>

        {/* Activity indicator */}
        <div
          className="mb-6 flex items-center justify-center gap-2"
          style={{ animation: "fade-up 0.5s ease 0.05s both" }}
        >
          <div className="relative flex items-center justify-center">
            <div
              className="absolute rounded-full"
              style={{
                width: "16px",
                height: "16px",
                background: "var(--primary)",
                opacity: 0.2,
                animation: "ripple 2s ease-out infinite",
              }}
            />
            <div
              className="rounded-full"
              style={{
                width: "8px",
                height: "8px",
                background: "var(--primary)",
                boxShadow: "0 0 8px var(--primary)",
              }}
            />
          </div>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              color: "var(--foreground-muted)",
            }}
          >
            Available for opportunities
          </span>
        </div>

        {/* Name heading */}
        <h1
          className="mb-6 font-bold"
          style={{
            fontSize: "clamp(2.5rem, 6vw, 3.75rem)",
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            animation: "fade-up 0.5s ease 0.1s both",
          }}
        >
          <span className="block" style={{ color: "var(--foreground)" }}>
            Hi, I&apos;m
          </span>
          <span className="block" style={{ color: "var(--primary)" }}>
            付小晨
          </span>
        </h1>

        {/* Bio */}
        <p
          className="mx-auto mb-8 max-w-xl"
          style={{
            fontSize: "1.1rem",
            color: "var(--foreground-muted)",
            lineHeight: 1.6,
            animation: "fade-up 0.5s ease 0.2s both",
          }}
        >
          2020 年毕业，喜欢 Coding 和打游戏。专注于前端开发，探索技术的无限可能。
        </p>

        {/* Skill tags */}
        <div
          className="flex flex-wrap items-center justify-center gap-2"
          style={{ animation: "fade-up 0.5s ease 0.3s both" }}
        >
          {skillTags.map((tag) => (
            <span
              key={tag}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.72rem",
                background: "var(--tag-bg)",
                color: "var(--tag-fg)",
                border: "1px solid var(--tag-border)",
                borderRadius: "0.375rem",
                padding: "0.3rem 0.75rem",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// Skills section
function Skills() {
  return (
    <section className={`
      px-6 py-16
      md:py-24
    `}>
      <div className="mx-auto max-w-5xl">
        {/* Section label */}
        <div className="mb-10 flex items-center gap-4">
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              color: "var(--foreground-subtle)",
              textTransform: "uppercase",
              letterSpacing: "0.10em",
              whiteSpace: "nowrap",
            }}
          >
            Tech Stack
          </span>
          <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
        </div>

        {/* Skills grid */}
        <div className={`
          grid grid-cols-3 gap-4
          sm:grid-cols-4
          md:grid-cols-5
          lg:grid-cols-6
        `}>
          {allSkills.map((skill, index) => (
            <div
              key={index}
              className={`
                group flex cursor-default flex-col items-center gap-3 rounded-[0.5rem] p-4 transition-all duration-300
                hover:-translate-y-[2px] hover:border-[var(--primary)] hover:bg-[var(--background-elevated)]
                md:p-5
              `}
              style={{ border: "1px solid transparent" }}
            >
              <div className={`
                h-12 w-12 transition-transform duration-300
                group-hover:scale-110
                md:h-14 md:w-14
              `}>
                <span className={skill.icon + " h-full w-full"} />
              </div>
              <span
                className={`
                  text-center transition-colors duration-200
                  group-hover:text-[var(--foreground)]
                `}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  color: "var(--foreground-subtle)",
                }}
              >
                {skill.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Setup / Devices section
function Devices() {
  const featuredDevices = devices.filter((d) => d.featured);
  const otherDevices = devices.filter((d) => !d.featured);

  return (
    <section className={`
      px-6 py-16
      md:py-24
    `}>
      <div className="mx-auto max-w-5xl">
        {/* Section label */}
        <div className="mb-10 flex items-center gap-4">
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              color: "var(--foreground-subtle)",
              textTransform: "uppercase",
              letterSpacing: "0.10em",
              whiteSpace: "nowrap",
            }}
          >
            Setup & Devices
          </span>
          <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
        </div>

        {/* Featured devices */}
        <div className={`
          mb-6 grid gap-6
          md:grid-cols-2
        `}>
          {featuredDevices.map((device, index) => (
            <div
              key={index}
              className={`
                group relative overflow-hidden rounded-[0.5rem] p-8 transition-all duration-300
                hover:-translate-y-[2px] hover:border-[var(--border-hover)]
              `}
              style={{
                border: "1px solid var(--border)",
                background: "var(--background-subtle)",
              }}
            >
              <span
                className="mb-4 inline-block"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  background: "var(--tag-bg)",
                  color: "var(--tag-fg)",
                  border: "1px solid var(--tag-border)",
                  borderRadius: "0.375rem",
                  padding: "0.2rem 0.6rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {device.description}
              </span>
              <h3
                className="mb-1 font-bold"
                style={{ fontSize: "1.4rem", color: "var(--foreground)" }}
              >
                {device.name}
              </h3>
              {device.spec && (
                <p style={{ fontSize: "0.9rem", color: "var(--primary)" }}>{device.spec}</p>
              )}
            </div>
          ))}
        </div>

        {/* Other devices as pills */}
        <div className="flex flex-wrap gap-3">
          {otherDevices.map((device, index) => (
            <div
              key={index}
              className="flex items-center gap-2 transition-all duration-200"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.72rem",
                background: "var(--tag-bg)",
                color: "var(--tag-fg)",
                border: "1px solid var(--tag-border)",
                borderRadius: "0.375rem",
                padding: "0.35rem 0.75rem",
              }}
            >
              <span>{device.name}</span>
              {device.description && (
                <span style={{ opacity: 0.6 }}>· {device.description}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Bottom CTA
function BottomCTA() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div
          className="relative overflow-hidden rounded-[0.75rem] px-8 py-16 text-center"
          style={{
            background:
              "radial-gradient(ellipse at center, var(--primary-glow) 0%, var(--background-elevated) 100%)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 80% at 50% 50%, var(--primary-glow), transparent)",
            }}
          />
          <div className="relative">
            <h2
              className="mb-4 font-bold"
              style={{
                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                letterSpacing: "-0.03em",
                color: "var(--foreground)",
              }}
            >
              看到这里了？
            </h2>
            <p
              className="mx-auto mb-8 max-w-md"
              style={{ color: "var(--foreground-muted)", fontSize: "1rem" }}
            >
              来我的博客看看吧，有更多技术分享和学习笔记
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 transition-all duration-300"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
                padding: "0.75rem 1.75rem",
                borderRadius: "0.5rem",
                fontSize: "0.95rem",
                fontWeight: 600,
              }}
            >
              浏览博客
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div>
      <Hero />
      <Skills />
      <Devices />
      <BottomCTA />
    </div>
  );
}
