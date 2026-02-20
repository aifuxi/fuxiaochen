import Link from "next/link";
import {
  Laptop,
  Monitor,
  Keyboard,
  Mouse,
  Gamepad2,
  Terminal,
  Server,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/typography/text";
import { Title } from "@/components/ui/typography/title";

// 技能数据 - 带图标
const skillCategories = [
  {
    title: "前端",
    icon: Sparkles,
    description: "主要技术栈",
    skills: [
      { name: "HTML", icon: "icon-[skill-icons--html]" },
      { name: "CSS", icon: "icon-[skill-icons--css]" },
      { name: "JavaScript", icon: "icon-[skill-icons--javascript]" },
      { name: "TypeScript", icon: "icon-[skill-icons--typescript]" },
      { name: "React", icon: "icon-[skill-icons--react-dark]" },
      { name: "Next.js", icon: "icon-[skill-icons--nextjs-dark]" },
      { name: "TailwindCSS", icon: "icon-[skill-icons--tailwindcss-dark]" },
    ],
  },
  {
    title: "后端",
    icon: Server,
    description: "简单 CRUD 水平",
    skills: [
      { name: "Go", icon: "icon-[skill-icons--golang]" },
      { name: "MySQL", icon: "icon-[skill-icons--mysql-dark]" },
    ],
  },
  {
    title: "开发工具",
    icon: Terminal,
    description: "日常使用",
    skills: [
      { name: "Git", icon: "icon-[skill-icons--git]" },
      { name: "GitHub", icon: "icon-[skill-icons--github-dark]" },
      { name: "Docker", icon: "icon-[skill-icons--docker]" },
      { name: "Linux", icon: "icon-[skill-icons--linux-dark]" },
      { name: "Nginx", icon: "icon-[skill-icons--nginx]" },
      { name: "Figma", icon: "icon-[skill-icons--figma-dark]" },
    ],
  },
];

// 设备数据
const devices = [
  {
    icon: Laptop,
    name: "MacBook Pro",
    spec: "14-inch M3 Max 64G",
    description: "主力机，干活、编程、学习",
  },
  {
    icon: Gamepad2,
    name: "微星 GP76",
    spec: "RTX 3070",
    description: "打游戏用",
  },
  {
    icon: Monitor,
    name: "LG 显示器",
    spec: "27 英寸 4K HDR",
    description: "",
  },
  {
    icon: Keyboard,
    name: "珂芝 K75",
    spec: "",
    description: "",
  },
  {
    icon: Mouse,
    name: "罗技 PRO 2 代",
    spec: "",
    description: "",
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
          <br className={`
            hidden
            sm:block
          `} />
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

// 技能区域 - Apple 风格
function Skills() {
  return (
    <section className="mb-16 space-y-8">
      <div className="text-center">
        <Title level={2} className="mb-2">
          技能
        </Title>
        <Text type="secondary">我的技术栈与工具</Text>
      </div>

      {/* 技能分类 */}
      <div className="space-y-8">
        {skillCategories.map((category, index) => {
          const Icon = category.icon;
          return (
            <div key={index} className="space-y-4">
              {/* 分类标题 */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10`}
                >
                  <Icon className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-text">{category.title}</h3>
                  {category.description && (
                    <p className="text-xs text-text-tertiary">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>

              {/* 技能图标网格 */}
              <Card className="p-4">
                <div className={`flex flex-wrap gap-3`}>
                  {category.skills.map((skill, skillIndex) => (
                    <div
                      key={skillIndex}
                      className={`
                        group flex items-center gap-2 rounded-lg bg-surface px-3 py-2 transition-all duration-200
                        hover:bg-accent/10
                      `}
                    >
                      <span
                        className={`
                          inline-block h-5 w-5 transition-transform duration-200
                          group-hover:scale-110
                        `}
                      >
                        <span className={skill.icon} />
                      </span>
                      <span
                        className={`
                          text-sm text-text-secondary transition-colors duration-200
                          group-hover:text-text
                        `}
                      >
                        {skill.name}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// 设备区域
function Devices() {
  return (
    <section className="mb-16 space-y-6">
      <div className="text-center">
        <Title level={2} className="mb-2">
          我的设备
        </Title>
        <Text type="secondary">日常使用的硬件设备</Text>
      </div>

      <div
        className={`
          grid gap-4
          sm:grid-cols-2
          lg:grid-cols-3
        `}
      >
        {devices.map((device, index) => {
          const Icon = device.icon;
          return (
            <Card
              key={index}
              className={`
                group relative overflow-hidden p-5 transition-all duration-200
                hover:shadow-lg
              `}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`
                    flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface transition-colors
                    duration-200
                    group-hover:bg-accent/10
                  `}
                >
                  <Icon
                    className={`
                      h-6 w-6 text-text-secondary transition-colors duration-200
                      group-hover:text-accent
                    `}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-medium text-text">
                    {device.name}
                  </h3>
                  {device.spec && (
                    <p className="mt-0.5 text-sm text-accent">{device.spec}</p>
                  )}
                  {device.description && (
                    <p className="mt-1 text-sm text-text-tertiary">
                      {device.description}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

// 底部 CTA
function BottomCTA() {
  return (
    <section
      className={`
        relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface via-surface to-surface-hover py-12
        md:py-16
      `}
    >
      {/* 装饰 */}
      <div
        className={`
          pointer-events-none absolute -top-20 -right-20 h-[200px] w-[200px] rounded-full bg-accent/10 blur-3xl
        `}
      />
      <div
        className={`
          pointer-events-none absolute -bottom-20 -left-20 h-[200px] w-[200px] rounded-full bg-info/10 blur-3xl
        `}
      />

      <div className="relative mx-auto max-w-2xl px-6 text-center">
        <h2
          className={`
            mb-4 text-2xl font-bold text-text
            md:text-3xl
          `}
        >
          想了解更多？
        </h2>
        <p className="mb-8 text-text-secondary">
          查看我的博客文章，了解更多技术分享
        </p>
        <Link
          href="/blog"
          className={`
            inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white shadow-sm
            transition-all duration-200
            hover:bg-accent-hover-color
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
