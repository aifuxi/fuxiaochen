import Link from "next/link";
import { Card } from "@/components/ui/card";

// 技能数据 - 带图标
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

// 设备数据
const devices = [
  {
    name: "MacBook Pro",
    spec: "14-inch M3 Max 64G",
    description: "主力机",
    featured: true,
  },
  {
    name: "微星 GP76",
    spec: "RTX 3070",
    description: "游戏机",
    featured: true,
  },
  {
    name: "LG 27 英寸 4K HDR",
    spec: "",
    description: "显示器",
    featured: false,
  },
  {
    name: "珂芝 K75",
    spec: "",
    description: "键盘",
    featured: false,
  },
  {
    name: "罗技 PRO 2 代",
    spec: "",
    description: "鼠标",
    featured: false,
  },
];

// Hero 区域 - Apple 大胆风格
function Hero() {
  return (
    <section
      className={`
        relative flex min-h-[60vh] items-center justify-center overflow-hidden py-20
        md:py-32
      `}
    >
      {/* 动态渐变背景 */}
      <div
        className={`
          pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]
          from-accent/10 via-transparent to-transparent
        `}
      />
      <div
        className={`
          pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full
          bg-gradient-to-b from-accent/5 via-info/5 to-transparent blur-3xl
        `}
      />
      <div
        className={`
          pointer-events-none absolute right-0 -bottom-40 h-[400px] w-[500px] rounded-full bg-gradient-to-tl
          from-warning/5 to-transparent blur-3xl
        `}
      />

      {/* 内容 */}
      <div className="relative mx-auto max-w-4xl px-4 text-center">
        {/* 小标签 */}
        <div
          className={`
            mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-surface/50 px-4 py-1.5 text-sm
            text-text-secondary backdrop-blur-sm
          `}
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75`}
            />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          前端开发工程师
        </div>

        {/* 大标题 */}
        <h1
          className={`
            mb-6 text-5xl font-bold tracking-tight
            md:text-7xl
            lg:text-8xl
          `}
        >
          <span className="block text-text">Hi, I&apos;m</span>
          <span
            className={`block bg-gradient-to-r from-accent via-info to-accent bg-clip-text text-transparent`}
          >
            付小晨
          </span>
        </h1>

        {/* 描述 */}
        <p
          className={`
            mx-auto mb-8 max-w-xl text-lg text-text-secondary
            md:text-xl
          `}
        >
          2020 年毕业，喜欢 Coding 和打游戏。
          <br
            className={`
              hidden
              sm:block
            `}
          />
          专注于前端开发，探索技术的无限可能。
        </p>

        {/* 技术栈标签 */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span
            className={`
              inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent
            `}
          >
            <span className="icon-[skill-icons--react-dark] h-4 w-4" />
            React
          </span>
          <span className="text-text-tertiary">+</span>
          <span
            className={`inline-flex items-center gap-2 rounded-full bg-info/10 px-4 py-2 text-sm font-medium text-info`}
          >
            <span className="icon-[skill-icons--golang] h-4 w-4" />
            Go
          </span>
          <span className="text-text-tertiary">+</span>
          <span
            className={`
              inline-flex items-center gap-2 rounded-full bg-warning/10 px-4 py-2 text-sm font-medium text-warning
            `}
          >
            <span className="icon-[skill-icons--tailwindcss-dark] h-4 w-4" />
            Tailwind
          </span>
        </div>
      </div>
    </section>
  );
}

// 技能区域 - Apple 大胆风格
function Skills() {
  return (
    <section
      className={`
        relative overflow-hidden py-20
        md:py-32
      `}
    >
      {/* 背景装饰 */}
      <div
        className={`
          pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-surface/50 to-transparent
        `}
      />

      <div className="relative mx-auto max-w-5xl px-4">
        {/* 标题 */}
        <div
          className={`
            mb-12 text-center
            md:mb-16
          `}
        >
          <h2
            className={`
              mb-4 text-4xl font-bold tracking-tight text-text
              md:text-5xl
            `}
          >
            Tech Stack
          </h2>
          <p className="text-lg text-text-secondary">我熟练使用的技术与工具</p>
        </div>

        {/* 技能网格 - 大图标 */}
        <div
          className={`
            grid grid-cols-3 gap-4
            sm:grid-cols-4
            md:grid-cols-5
            lg:grid-cols-6
          `}
        >
          {allSkills.map((skill, index) => (
            <div
              key={index}
              className={`
                group flex flex-col items-center gap-3 rounded-2xl p-4 transition-all duration-300
                hover:bg-surface
                md:p-6
              `}
            >
              <div
                className={`
                  h-12 w-12 transition-transform duration-300
                  group-hover:scale-110
                  md:h-16 md:w-16
                `}
              >
                <span className={skill.icon + " h-full w-full"} />
              </div>
              <span
                className={`
                  text-center text-xs text-text-secondary transition-colors duration-200
                  group-hover:text-text
                  md:text-sm
                `}
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

// 设备区域 - Apple 大胆风格
function Devices() {
  const featuredDevices = devices.filter((d) => d.featured);
  const otherDevices = devices.filter((d) => !d.featured);

  return (
    <section
      className={`
        py-20
        md:py-32
      `}
    >
      <div className="mx-auto max-w-5xl px-4">
        {/* 标题 */}
        <div
          className={`
            mb-12 text-center
            md:mb-16
          `}
        >
          <h2
            className={`
              mb-4 text-4xl font-bold tracking-tight text-text
              md:text-5xl
            `}
          >
            我的设备
          </h2>
          <p className="text-lg text-text-secondary">日常使用的硬件设备</p>
        </div>

        {/* 主力设备 - 大卡片 */}
        <div
          className={`
            mb-8 grid gap-6
            md:grid-cols-2
          `}
        >
          {featuredDevices.map((device, index) => (
            <Card
              key={index}
              className={`
                group relative overflow-hidden p-8 transition-all duration-300
                hover:shadow-xl
              `}
            >
              {/* 装饰渐变 */}
              <div
                className={`
                  pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br from-accent/10
                  to-transparent opacity-0 blur-2xl transition-opacity duration-300
                  group-hover:opacity-100
                `}
              />
              <div className="relative">
                <span
                  className={`mb-4 inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent`}
                >
                  {device.description}
                </span>
                <h3
                  className={`
                    mb-2 text-2xl font-bold text-text
                    md:text-3xl
                  `}
                >
                  {device.name}
                </h3>
                {device.spec && (
                  <p className="text-lg text-accent">{device.spec}</p>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* 其他设备 - 紧凑列表 */}
        <div className="flex flex-wrap justify-center gap-4">
          {otherDevices.map((device, index) => (
            <div
              key={index}
              className={`
                flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 transition-colors
                duration-200
                hover:border-accent/30
              `}
            >
              <span className="text-sm font-medium text-text">
                {device.name}
              </span>
              {device.description && (
                <span className="text-xs text-text-tertiary">
                  · {device.description}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 底部 CTA - Apple 大胆风格
function BottomCTA() {
  return (
    <section
      className={`
        relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent/5 via-surface to-info/5 py-20
        md:py-28
      `}
    >
      {/* 装饰 */}
      <div
        className={`
          pointer-events-none absolute -top-20 -left-20 h-[300px] w-[300px] rounded-full bg-accent/20 blur-3xl
        `}
      />
      <div
        className={`
          pointer-events-none absolute -right-20 -bottom-20 h-[300px] w-[300px] rounded-full bg-info/20 blur-3xl
        `}
      />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <h2
          className={`
            mb-6 text-3xl font-bold text-text
            md:text-4xl
          `}
        >
          看到这里了？
        </h2>
        <p
          className={`
            mx-auto mb-10 max-w-md text-lg text-text-secondary
            md:text-xl
          `}
        >
          来我的博客看看吧，有更多技术分享和学习笔记
        </p>
        <Link
          href="/blog"
          className={`
            hover:bg-accent-hover
            inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-medium text-white shadow-lg
            transition-all duration-300
            active:scale-[0.98]
          `}
        >
          浏览博客
        </Link>
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4">
      {/* Hero - 全屏大胆设计 */}
      <Hero />

      {/* 技能 */}
      <Skills />

      {/* 设备 */}
      <Devices />

      {/* 底部 CTA */}
      <BottomCTA />
    </div>
  );
}
