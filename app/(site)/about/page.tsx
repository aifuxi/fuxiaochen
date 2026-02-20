import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Title } from "@/components/ui/typography/title";
import { Text } from "@/components/ui/typography/text";
import {
  Code2,
  Server,
  Wrench,
  Laptop,
  Monitor,
  Keyboard,
  Mouse,
  Gamepad2,
} from "lucide-react";

// 技能数据
const skills = {
  frontend: {
    title: "前端",
    icon: Code2,
    items: [
      { name: "HTML + CSS + JavaScript", level: "熟练" },
      { name: "TypeScript", level: "熟练" },
      { name: "React + Next.js", level: "熟练" },
      { name: "ahooks", level: "熟练" },
      { name: "Tailwind CSS", level: "熟练" },
    ],
  },
  backend: {
    title: "后端",
    icon: Server,
    items: [{ name: "Go + MySQL", level: "简单 CRUD" }],
  },
  other: {
    title: "其他",
    icon: Wrench,
    items: [
      { name: "Zsh + Oh My Zsh + iTerm2" },
      { name: "Debian / CentOS / Rocky Linux 部署" },
      { name: "Docker" },
      { name: "NGINX（反向代理 + HTTPS + HTTP2）" },
      { name: "Figma" },
      { name: "Google + GitHub + Stack Overflow" },
      { name: "AI 工具（Claude Code + 豆包）" },
    ],
  },
};

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

// Hero 区域
function Hero() {
  return (
    <section className={`
      relative overflow-hidden py-16
      md:py-24
    `}>
      {/* 装饰性渐变 */}
      <div className={`
        pointer-events-none absolute -top-40 left-1/4 h-[400px] w-[600px] rounded-full bg-gradient-to-br from-accent/10
        via-info/5 to-transparent blur-3xl
      `} />
      <div className={`
        pointer-events-none absolute right-0 -bottom-20 h-[300px] w-[400px] rounded-full bg-gradient-to-tl
        from-warning/10 to-transparent blur-3xl
      `} />

      <div className="relative mx-auto max-w-3xl">
        <div className={`
          flex flex-col items-center gap-8
          md:flex-row md:gap-12
        `}>
          {/* 头像 */}
          <div className="relative shrink-0">
            <div className={`
              relative h-32 w-32 overflow-hidden rounded-full bg-gradient-to-br from-accent to-info p-[3px]
              md:h-40 md:w-40
            `}>
              <div className={`
                flex h-full w-full items-center justify-center rounded-full bg-surface text-5xl font-bold text-accent
                md:text-6xl
              `}>
                付
              </div>
            </div>
            {/* 状态指示器 */}
            <div className={`
              absolute right-2 bottom-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface
              bg-success
            `}>
              <div className="h-2 w-2 rounded-full bg-white" />
            </div>
          </div>

          {/* 介绍文字 */}
          <div className={`
            flex-1 text-center
            md:text-left
          `}>
            <Title level={1} className="mb-3">
              Hi~ 我是付小晨
            </Title>
            <Text type="secondary" className="mb-4 text-lg">
              前端开发工程师
            </Text>
            <Text type="secondary" className="leading-relaxed">
              2020 年毕业，喜欢 Coding 和打游戏。
              <br />
              技术栈：<span className="text-accent">React</span> +{" "}
              <span className="text-info">Go</span>
            </Text>
          </div>
        </div>
      </div>
    </section>
  );
}

// 技能区域
function Skills() {
  return (
    <section className="mb-16 space-y-6">
      <div className="text-center">
        <Title level={2} className="mb-2">
          技能
        </Title>
        <Text type="secondary">我的技术栈与工具</Text>
      </div>

      <div className={`
        grid gap-6
        md:grid-cols-3
      `}>
        {Object.entries(skills).map(([key, skill]) => {
          const Icon = skill.icon;
          return (
            <Card key={key} className="relative overflow-hidden p-6">
              {/* 卡片装饰 */}
              <div className={`
                pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-accent/10
                to-transparent blur-2xl
              `} />

              <div className="relative">
                {/* 标题 */}
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-text">
                    {skill.title}
                  </h3>
                </div>

                {/* 技能列表 */}
                <ul className="space-y-2">
                  {skill.items.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-text">{item.name}</span>
                      {"level" in item && item.level && (
                        <Badge variant="secondary" className="text-xs">
                          {item.level}
                        </Badge>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
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

      <div className={`
        grid gap-4
        sm:grid-cols-2
        lg:grid-cols-3
      `}>
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
    <section className={`
      relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface via-surface to-surface-hover py-12
      md:py-16
    `}>
      {/* 装饰 */}
      <div className={`
        pointer-events-none absolute -top-20 -right-20 h-[200px] w-[200px] rounded-full bg-accent/10 blur-3xl
      `} />
      <div className={`
        pointer-events-none absolute -bottom-20 -left-20 h-[200px] w-[200px] rounded-full bg-info/10 blur-3xl
      `} />

      <div className="relative mx-auto max-w-2xl px-6 text-center">
        <h2 className={`
          mb-4 text-2xl font-bold text-text
          md:text-3xl
        `}>
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
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Hero */}
      <Hero />

      {/* 分隔线 */}
      <div className="mb-16 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* 技能 */}
      <Skills />

      {/* 设备 */}
      <Devices />

      {/* 底部 CTA */}
      <BottomCTA />
    </div>
  );
}
