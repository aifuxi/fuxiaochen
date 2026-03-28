"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Reveal } from "@/components/ui/reveal";
import { NICKNAME, EMAIL } from "@/constants/info";
import Navbar from "@/components/navbar";

// Info Card Component
function InfoCard() {
  return (
    <Reveal className="mt-10 rounded-2xl border border-primary/20 p-6" style={{ background: "rgba(16, 185, 129, 0.05)" }}>
      <div className="flex items-start gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "rgba(16, 185, 129, 0.15)" }}
        >
          <svg
            className="h-5 w-5 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <div>
          <h3 className="mb-2 font-mono text-sm font-semibold">如何添加友链</h3>
          <ul className="space-y-2 text-sm text-muted">
            <li className="flex items-start gap-2">
              <span className="text-primary">01</span>
              <span>网站内容为原创，遵守法律法规和道德规范</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">02</span>
              <span>网站有自己的持续更新内容，非纯导航页</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">03</span>
              <span>网站设计美观，无恶意弹窗或广告</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">04</span>
              <span>在下方表单提交申请，我会尽快处理</span>
            </li>
          </ul>
        </div>
      </div>
    </Reveal>
  );
}

// Friend Card Component
function FriendCard({
  name,
  role,
  description,
  website,
  avatar,
  delay = 0,
}: {
  name: string;
  role: string;
  description: string;
  website: string;
  avatar: string;
  delay?: number;
}) {
  return (
    <Reveal delay={delay}>
      <motion.div
        className="block rounded-xl border border-white/8 bg-card p-6"
        whileHover={{
          y: -4,
          borderColor: "var(--primary)",
          boxShadow: "0 0 30px rgba(16, 185, 129, 0.1)",
        }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link href="#">
          <div className="mb-4 flex items-center gap-4">
            <Avatar size="lg" className="ring-0">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-mono text-sm font-semibold">{name}</h4>
              <p className="text-xs text-muted">{role}</p>
            </div>
          </div>
          <p className="mb-4 text-sm leading-relaxed font-light text-muted">
            {description}
          </p>
          <div className="flex items-center gap-2 text-xs text-primary">
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0 3-4.03 3-9s-1.343-9-3-9m-9 9a9 9 0 019-9"
              />
            </svg>
            <span className="font-mono">{website}</span>
          </div>
        </Link>
      </motion.div>
    </Reveal>
  );
}

// Friends Section
function FriendsSection() {
  const friends = [
    {
      name: "John Doe",
      role: "全栈开发者",
      description: "专注于 Web 技术和开源项目，喜欢分享开发心得与踩坑记录。",
      website: "johndoe.dev",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    },
    {
      name: "Sarah Chen",
      role: "设计师 & 插画师",
      description: "探索设计与人机交互的边界，分享 UI/UX 设计的思考与灵感。",
      website: "sarahdesign.io",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    },
    {
      name: "Michael Wu",
      role: "AI 研究者",
      description: "关注机器学习和人工智能领域，翻译和解读最新学术论文。",
      website: "aimichael.tech",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    },
    {
      name: "Emma Zhang",
      role: "产品经理",
      description: "分享产品思考与方法论，关注用户增长和商业模式创新。",
      website: "emmazhang.pm",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    },
    {
      name: "David Lin",
      role: "独立开发者",
      description: "一个人做 App，正在打造让生活更美好的工具类产品。",
      website: "davidlin.app",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    },
    {
      name: "Lisa Wang",
      role: "科技博主",
      description: "用通俗易懂的语言解读科技趋势，让技术走进大众视野。",
      website: "lisa.tech",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
    },
  ];

  return (
    <section className="relative px-8 pb-32">
      <div className="mx-auto max-w-4xl">
        <div className={`
          grid gap-6
          md:grid-cols-2
          lg:grid-cols-3
        `}>
          {friends.map((friend, index) => (
            <FriendCard key={friend.name} {...friend} delay={index * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Apply Form Section
function ApplySection() {
  return (
    <section className="relative px-8 pb-32">
      <div className="mx-auto max-w-4xl">
        <Reveal className="rounded-2xl border border-white/10 p-8 backdrop-blur-xl" style={{ background: "var(--card)" }}>
          <div className="mb-6 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20"
              style={{ background: "rgba(16, 185, 129, 0.1)" }}
            >
              <svg
                className="h-5 w-5 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="font-serif text-2xl tracking-tight">申请友链</h2>
          </div>
          <p className="mb-8 text-sm text-muted">
            填写以下信息提交友链申请，我会尽快处理。请确保您的网站符合上述要求。
          </p>
          <form className="space-y-4">
            <div className={`
              grid gap-4
              md:grid-cols-2
            `}>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  网站名称
                </label>
                <Input placeholder="例如：John 的博客" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  网站地址
                </label>
                <Input type="url" placeholder="https://example.com" />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                网站描述
              </label>
              <Input placeholder="简要描述您的网站内容" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                头像链接（可选）
              </label>
              <Input type="url" placeholder="https://example.com/avatar.jpg" />
            </div>
            <div className="pt-4">
              <Button variant="primary-glow" className={`
                w-full
                md:w-auto
              `}>
                提交申请
              </Button>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="border-t border-white/5 px-8 py-12">
      <div className="mx-auto max-w-4xl">
        <div className={`
          flex flex-col items-center justify-between gap-6
          md:flex-row
        `}>
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
              <span className="font-mono text-xs font-bold text-black">FC</span>
            </div>
            <span className="font-mono text-xs text-muted">{NICKNAME}</span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`
                text-muted transition-colors duration-300
                hover:text-foreground
              `}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`
                text-muted transition-colors duration-300
                hover:text-foreground
              `}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <a
              href="/rss.xml"
              className={`
                text-muted transition-colors duration-300
                hover:text-foreground
              `}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z" />
              </svg>
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className={`
                text-muted transition-colors duration-300
                hover:text-foreground
              `}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </a>
          </div>

          {/* Copyright */}
          <span className="font-mono text-xs text-muted/60">
            © 2024 {NICKNAME}. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}

// Main Page Component
export default function FriendsPage() {
  return (
    <main className="min-h-screen">
      {/* Background Blobs */}
      <div
        className="morph-blob morph-blob-1 pointer-events-none fixed"
        style={{
          width: 384,
          height: 384,
          background: "rgba(16, 185, 129, 0.03)",
          filter: "blur(80px)",
          zIndex: 0,
        }}
      />
      <div
        className="morph-blob morph-blob-2 pointer-events-none fixed"
        style={{
          width: 384,
          height: 384,
          background: "rgba(16, 185, 129, 0.03)",
          filter: "blur(80px)",
          zIndex: 0,
          top: "60%",
          right: "5%",
        }}
      />
      <div
        className="morph-blob morph-blob-3 pointer-events-none fixed"
        style={{
          width: 384,
          height: 384,
          background: "rgba(16, 185, 129, 0.03)",
          filter: "blur(80px)",
          zIndex: 0,
          bottom: "10%",
          left: "40%",
        }}
      />

      <Navbar />

      {/* Hero */}
      <section className="relative px-8 pt-32 pb-16">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <span className="mb-4 block font-mono text-xs tracking-widest text-primary uppercase">
              Connection
            </span>
            <h1
              className={`
                mb-6 font-serif text-5xl
                lg:text-6xl
              `}
              style={{ lineHeight: 0.95 }}
            >
              Friends
            </h1>
            <p className="max-w-xl text-lg leading-relaxed font-light text-muted">
              与志同道合的创作者建立连接。这里收录了优秀的个人博客和项目，每一行链接都是一次思想的碰撞。
            </p>
          </Reveal>

          <InfoCard />
        </div>
      </section>

      <FriendsSection />
      <ApplySection />
      <Footer />
    </main>
  );
}
