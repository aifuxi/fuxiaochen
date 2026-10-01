"use client";

import { BorderBeam } from "border-beam";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Code2,
  Copy,
  ExternalLink,
  Layers3,
  Menu,
  MousePointer2,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ThinkingOrb } from "thinking-orbs";

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardStage } from "@/components/ui/card";
import {
  Combobox,
  ComboboxClear,
  ComboboxContent,
  ComboboxInput,
  ComboboxInputGroup,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsPanel, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const nav = [
  ["01", "概览", "overview"],
  ["02", "视觉基础", "foundations"],
  ["03", "组件", "components"],
  ["04", "表单", "forms"],
  ["05", "动效", "motion"],
  ["06", "实现规范", "guidelines"],
];
const principles = [
  {
    Icon: Layers3,
    number: "01",
    title: "暗色材质",
    text: "三层近黑表面，靠内高光与细边线建立深度。",
  },
  {
    Icon: MousePointer2,
    number: "02",
    title: "即时反馈",
    text: "悬停提亮、按下压暗，让控件回应每次操作。",
  },
  {
    Icon: Sparkles,
    number: "03",
    title: "有节制的动态",
    text: "动画留给展示与状态变化，内容始终清晰。",
  },
];
const swatches = [
  ["Background", "#121212"],
  ["Surface", "#181818"],
  ["Stage", "#131313"],
  ["Raised", "#2A2A2A"],
  ["Primary", "#0066DF"],
  ["Foreground", "#F5F5F5"],
];
const contactTopics = [
  { label: "产品设计", value: "design" },
  { label: "前端开发", value: "frontend" },
  { label: "其他合作", value: "collaboration" },
];
const technologies = [
  "React",
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "Base UI",
  "Figma",
  "Node.js",
  "Python",
];

function SectionHead({
  index,
  title,
  description,
}: {
  index: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 border-t border-white/[.07] pt-8 lg:flex-row lg:items-end">
      <div>
        <p className="mb-3 font-mono text-[10px] tracking-[.18em] text-[#777] uppercase">{index}</p>
        <h2 className="font-display text-[32px] font-medium tracking-[-.04em] text-white md:text-[38px]">
          {title}
        </h2>
      </div>
      <p className="max-w-[390px] text-[13px] leading-6 text-[#999]">{description}</p>
    </div>
  );
}

function Beam({ active }: { active: boolean }) {
  return (
    <div className="flex h-full min-h-[180px] items-center justify-center">
      <BorderBeam
        size="md"
        colorVariant="ocean"
        theme="dark"
        active={active}
        style={{ width: 185 }}
      >
        <div className="flex h-[100px] w-[185px] items-center justify-center rounded-[20px] bg-[#171719] text-[13px] text-[#e7e7e7]">
          Border beam
        </div>
      </BorderBeam>
    </div>
  );
}

function Orb({ paused }: { paused: boolean }) {
  return (
    <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-3">
      <ThinkingOrb state="breathing" size={64} theme="dark" paused={paused} aria-hidden="true" />
      <span className="text-[11px] text-[#999]">构思中</span>
    </div>
  );
}

function DemoCard({
  kind,
  title,
  caption,
  selected = false,
  playing = false,
  onSelect,
}: {
  kind: "beam" | "orb" | "lift";
  title: string;
  caption: string;
  selected?: boolean;
  playing?: boolean;
  onSelect?: () => void;
}) {
  return (
    <Card className="showcase-card group p-3">
      <CardStage className="h-[190px] overflow-hidden">
        {kind === "beam" ? (
          <Beam active={playing} />
        ) : kind === "orb" ? (
          <Orb paused={!playing} />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="lift-object flex h-20 w-20 items-center justify-center rounded-[20px] bg-[#242424] shadow-[inset_0_1px_0_rgba(255,255,255,.08)]">
              <Layers3 size={25} strokeWidth={1.5} />
            </div>
          </div>
        )}
      </CardStage>
      <div className="flex items-center justify-between px-2 pt-4 pb-2">
        <div>
          <h3 className="text-[13px] font-medium text-white">{title}</h3>
          <p className="mt-1 text-[11px] text-[#777]">{caption}</p>
        </div>
        {onSelect ? (
          <button
            type="button"
            onClick={onSelect}
            aria-pressed={selected}
            aria-label={selected ? `正在预览 ${title}` : `预览 ${title}`}
            className="rounded-full border border-white/[.1] px-2.5 py-1 text-[11px] text-[#aaa] transition-colors hover:border-white/25 hover:text-white aria-pressed:bg-white/[.08] aria-pressed:text-white focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
          >
            {selected ? "已选中" : "预览"}
          </button>
        ) : (
          <ArrowRight
            size={16}
            className="-rotate-45 text-[#777] transition-transform group-hover:translate-x-1 group-hover:text-white"
          />
        )}
      </div>
    </Card>
  );
}

export default function Page() {
  const [motion, setMotion] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [selectedEffect, setSelectedEffect] = useState<"beam" | "orb">("beam");
  const [replay, setReplay] = useState(0);
  const [notice, setNotice] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchPreview, setSearchPreview] = useState("");

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(preference.matches);
    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  }
  async function copyColor() {
    await navigator.clipboard.writeText("#0066DF");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]"
      data-motion={motion ? "on" : "off"}
      id="top"
    >
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[228px] flex-col border-r border-white/[.07] bg-[#121212] px-5 py-7 lg:flex">
        <Link
          href="/"
          className="mb-14 flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
        >
          <span className="brand-mark flex h-8 w-8 items-center justify-center rounded-[10px] bg-white text-[18px] font-bold text-black">
            〰
          </span>
          <span className="text-[14px] font-medium tracking-[-.03em]">
            fuxiaochen<span className="text-[#777]">.design</span>
          </span>
        </Link>
        <p className="mb-4 px-3 font-mono text-[10px] tracking-[.18em] text-[#666] uppercase">
          Design spec
        </p>
        <nav aria-label="设计规范目录" className="space-y-1">
          {nav.map(([number, label, id]) => (
            <a
              key={id}
              href={`#${id}`}
              className="flex h-10 items-center gap-3 rounded-lg px-3 text-[13px] text-[#999] transition-colors hover:bg-white/[.05] hover:text-white focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
            >
              <span className="font-mono text-[10px] text-[#666]">{number}</span>
              {label}
            </a>
          ))}
        </nav>
        <div className="mt-auto rounded-[16px] border border-white/[.07] bg-[#191919] p-4">
          <div className="mb-2 flex items-center gap-2 text-xs text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-[#73d6a1] shadow-[0_0_10px_#73d6a1]" />{" "}
            System ready
          </div>
          <p className="text-[11px] leading-[1.6] text-[#888]">
            Tailwind CSS v4 · Base UI
            <br />
            本地可编辑组件
          </p>
        </div>
        <p className="mt-5 px-2 font-mono text-[10px] text-[#666]">v1.0 / 2026</p>
      </aside>
      <div className="lg:pl-[228px]">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/[.06] bg-[#121212]/90 px-5 backdrop-blur-xl md:px-8 lg:px-10">
          <div className="flex items-center gap-3 text-[12px] text-[#777]">
            <button
              className="rounded-md p-1 text-white lg:hidden"
              aria-label={mobileNav ? "关闭菜单" : "打开菜单"}
              onClick={() => setMobileNav(!mobileNav)}
            >
              {mobileNav ? <X size={18} /> : <Menu size={18} />}
            </button>
            <Link
              href="/"
              className="rounded-md hover:text-white focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
            >
              首页
            </Link>
            <span>/</span>
            <span className="text-[#ddd]">Design spec</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden rounded-full border border-white/[.09] bg-white/[.03] px-3 py-1 font-mono text-[10px] text-[#aaa] sm:inline-flex">
              DARK / INTERACTIVE
            </span>
            <a
              href="https://github.com/Jakubantalik/Libraries.dev"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-[12px] text-[#aaa] hover:text-white"
            >
              参考源码 <ExternalLink size={13} />
            </a>
          </div>
        </header>
        {mobileNav && (
          <nav
            aria-label="移动端设计规范目录"
            className="fixed inset-x-0 top-16 z-30 border-b border-white/10 bg-[#191919] p-4 lg:hidden"
          >
            {nav.map(([number, label, id]) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => setMobileNav(false)}
                className="block rounded-lg px-3 py-3 text-sm text-white hover:bg-white/5"
              >
                {number}　{label}
              </a>
            ))}
          </nav>
        )}
        <main className="mx-auto max-w-[1260px] px-5 pb-24 md:px-8 lg:px-10">
          <section id="overview" className="relative overflow-hidden pt-14 pb-20 md:pt-20">
            <div className="hero-grid pointer-events-none absolute inset-0" />
            <div className="relative grid items-center gap-10 xl:grid-cols-[1fr_380px]">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[.08] bg-white/[.035] px-3 py-1.5 text-[11px] text-[#aaa]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#73d6a1]" /> DESIGN SYSTEM / 001
                </div>
                <h1 className="font-display max-w-[760px] text-[46px] leading-[1.03] font-medium tracking-[-.055em] text-white sm:text-[58px] lg:text-[68px]">
                  安静的界面，
                  <br />
                  <span className="hero-gradient">有生命的细节。</span>
                </h1>
                <p className="mt-7 max-w-[560px] text-[15px] leading-[1.8] text-[#a0a0a0]">
                  一套以深色材质、克制的蓝色信号和流畅微交互构成的设计系统。把按钮、卡片与动效放进同一种视觉语言。
                </p>
                <div className="mt-8 flex flex-wrap gap-[11px]">
                  <a
                    href="#foundations"
                    className="ds-button ds-button-secondary inline-flex h-8 items-center rounded-full px-3"
                  >
                    查看设计原则
                  </a>
                  <a
                    href="#components"
                    className="ds-button ds-button-primary inline-flex h-8 items-center gap-2 rounded-full px-3"
                  >
                    探索组件 <ArrowRight size={14} />
                  </a>
                </div>
              </div>
              <div
                className="hero-art relative mx-auto hidden h-[350px] w-full max-w-[380px] xl:block"
                aria-hidden="true"
              >
                <div className="hero-halo absolute inset-[45px] rounded-full" />
                <div className="hero-tile hero-tile-a absolute top-7 left-0">
                  <div className="mini-orb" />
                </div>
                <div className="hero-tile hero-tile-b absolute top-2 right-0">
                  <div className="mini-beam">
                    <div />
                  </div>
                </div>
                <div className="hero-tile hero-tile-c absolute bottom-2 left-8">
                  <div className="gooey-blobs">
                    <i />
                    <i />
                  </div>
                </div>
                <div className="hero-tile hero-tile-d absolute right-1 bottom-8">
                  <Sparkles size={28} className="text-[#777]" />
                </div>
              </div>
            </div>
            <div className="relative mt-16 grid gap-3 md:grid-cols-3">
              {principles.map(({ Icon, number, title, text }) => (
                <Card
                  key={number}
                  className="flex min-h-[140px] flex-col justify-between p-5 transition-colors hover:bg-[#1c1c1c]"
                >
                  <div className="flex justify-between">
                    <Icon size={18} strokeWidth={1.6} />
                    <span className="font-mono text-[11px] text-[#666]">{number}</span>
                  </div>
                  <div>
                    <h3 className="mb-1 text-[14px] font-medium text-white">{title}</h3>
                    <p className="text-[12px] leading-5 text-[#888]">{text}</p>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section id="foundations" className="scroll-mt-20 pb-20">
            <SectionHead
              index="02 / FOUNDATIONS"
              title="视觉基础"
              description="色彩、排版、圆角和间距先建立秩序，再由交互赋予表面生命感。"
            />
            <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
              <Card className="p-5 md:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-[15px] font-medium text-white">色彩体系</h3>
                    <p className="mt-1 text-xs text-[#858585]">近黑层级与单一强调色</p>
                  </div>
                  <span className="font-mono text-[10px] text-[#777]">06 TOKENS</span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {swatches.map(([name, value]) => (
                    <div
                      key={name}
                      className="overflow-hidden rounded-[14px] border border-white/[.06] bg-[#141414]"
                    >
                      <div className="h-[92px]" style={{ background: value }} />
                      <div className="border-t border-white/[.06] px-3 py-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-medium">{name}</span>
                          {name === "Primary" && (
                            <button
                              onClick={copyColor}
                              aria-label="复制 Primary 色值"
                              className="rounded p-0.5 text-[#888] hover:text-white focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
                            >
                              {copied ? <Check size={13} /> : <Copy size={13} />}
                            </button>
                          )}
                        </div>
                        <p className="mt-1 font-mono text-[10px] text-[#777]">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <div className="grid gap-4">
                <Card className="p-5 md:p-6">
                  <div className="mb-5 flex justify-between">
                    <h3 className="text-[15px] font-medium">排版阶梯</h3>
                    <span className="font-mono text-[10px] text-[#777]">TYPE SCALE</span>
                  </div>
                  <p className="font-display text-[34px] leading-none tracking-[-.05em] text-white">
                    Shape the feeling.
                  </p>
                  <p className="mt-2 font-mono text-[10px] text-[#777]">
                    DISPLAY / SPACE GROTESK / 500
                  </p>
                  <div className="mt-5 border-t border-white/[.06] pt-4">
                    <p className="text-[15px] text-[#e5e5e5]">清晰的结构，让细节更动人。</p>
                    <p className="mt-1 font-mono text-[10px] text-[#777]">BODY / INTER / 400</p>
                  </div>
                </Card>
                <Card className="p-5 md:p-6">
                  <div className="mb-5 flex justify-between">
                    <h3 className="text-[15px] font-medium">形状与间距</h3>
                    <span className="font-mono text-[10px] text-[#777]">RADIUS</span>
                  </div>
                  <div className="flex items-end gap-4">
                    <div className="h-13 w-13 rounded-[8px] bg-[#282828]" />
                    <div className="h-13 w-13 rounded-[14px] bg-[#282828]" />
                    <div className="h-13 w-13 rounded-[24px] bg-[#282828]" />
                    <div className="h-10 w-[72px] rounded-full bg-[#282828]" />
                  </div>
                  <p className="mt-4 font-mono text-[10px] text-[#858585]">
                    8PX　/　14PX　/　24PX　/　PILL
                  </p>
                </Card>
              </div>
            </div>
          </section>

          <section id="components" className="scroll-mt-20 pb-20">
            <SectionHead
              index="03 / COMPONENTS"
              title="组件与状态"
              description="本地组件负责视觉样式，Base UI 负责语义与键盘交互。下方控件都可以直接操作。"
            />
            <Tabs defaultValue="buttons">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <TabsList>
                  <TabsTrigger value="buttons">按钮</TabsTrigger>
                  <TabsTrigger value="cards">卡片</TabsTrigger>
                  <TabsTrigger value="controls">控件</TabsTrigger>
                </TabsList>
                <span className="font-mono text-[10px] text-[#777]">INTERACTIVE PREVIEW</span>
              </div>
              <TabsPanel value="buttons">
                <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                  <Card className="p-3">
                    <CardStage className="flex min-h-[250px] flex-col items-center justify-center gap-5 p-5">
                      <div className="flex flex-wrap justify-center gap-[11px]">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => showNotice("Small secondary · 已触发")}
                        >
                          浏览组件
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => showNotice("Small primary · 已触发")}
                        >
                          主要操作
                        </Button>
                      </div>
                      <div className="flex flex-wrap justify-center gap-3">
                        <Button
                          variant="primary"
                          onClick={() => showNotice("Primary button · 已触发")}
                        >
                          标准按钮 <ArrowRight size={14} />
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => showNotice("Secondary button · 已触发")}
                        >
                          次要操作
                        </Button>
                        <Button variant="ghost" onClick={() => showNotice("Ghost button · 已触发")}>
                          轻量操作
                        </Button>
                      </div>
                      <div className="flex flex-wrap justify-center gap-3">
                        <Button variant="secondary" size="sm" disabled>
                          Disabled
                        </Button>
                      </div>
                    </CardStage>
                  </Card>
                  <Card className="flex flex-col justify-between p-6">
                    <div>
                      <div className="mb-5 flex items-center gap-2">
                        <span className="rounded-lg bg-white/[.06] p-2">
                          <MousePointer2 size={16} />
                        </span>
                        <span className="text-[14px] font-medium">Button anatomy</span>
                      </div>
                      <p className="text-[13px] leading-6 text-[#999]">
                        32 / 40px
                        胶囊。顶部高光、底部暗线和细内边线形成材质；悬停提亮，按下压暗，焦点环始终可见。
                      </p>
                    </div>
                    <div className="mt-6 space-y-1 border-t border-white/[.07] pt-4 font-mono text-[11px] text-[#888]">
                      <p className="flex justify-between">
                        <span>hover</span>
                        <span className="text-[#ccc]">200ms / smooth-out</span>
                      </p>
                      <p className="flex justify-between">
                        <span>focus</span>
                        <span className="text-[#ccc]">2px / blue ring</span>
                      </p>
                      <p className="flex justify-between">
                        <span>radius</span>
                        <span className="text-[#ccc]">full</span>
                      </p>
                    </div>
                  </Card>
                </div>
              </TabsPanel>
              <TabsPanel value="cards">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <DemoCard
                    kind="beam"
                    title="Border beam"
                    caption="边缘流光 · Highlight"
                    selected={selectedEffect === "beam"}
                    playing={selectedEffect === "beam" && motion && !reducedMotion}
                    onSelect={() => setSelectedEffect("beam")}
                  />
                  <DemoCard
                    kind="orb"
                    title="Thinking orb"
                    caption="柔和等待反馈 · Ambient"
                    selected={selectedEffect === "orb"}
                    playing={selectedEffect === "orb" && motion && !reducedMotion}
                    onSelect={() => setSelectedEffect("orb")}
                  />
                  <DemoCard kind="lift" title="Surface lift" caption="表面上浮 · Hover" />
                </div>
              </TabsPanel>
              <TabsPanel value="controls">
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card className="p-6">
                    <h3 className="text-[15px] font-medium">Switch</h3>
                    <p className="mt-1 mb-6 text-xs text-[#858585]">独立状态、明确标签与可见焦点</p>
                    <div className="flex items-center justify-between rounded-[14px] border border-white/[.07] bg-[#141414] p-4">
                      <span>
                        <label
                          htmlFor="motion-switch"
                          className="block cursor-pointer text-[13px] font-medium"
                        >
                          启用环境动效
                        </label>
                        <span className="mt-1 block text-[11px] text-[#858585]">
                          控制本页连续循环与装饰动画
                        </span>
                      </span>
                      <Switch
                        id="motion-switch"
                        aria-label="启用环境动效"
                        checked={motion}
                        onCheckedChange={setMotion}
                      />
                    </div>
                    <Dialog>
                      <DialogTrigger className="ds-button ds-button-secondary mt-5 inline-flex h-8 items-center gap-2 rounded-full px-3">
                        打开 Dialog <ArrowRight size={14} />
                      </DialogTrigger>
                      <DialogContent>
                        <div className="mb-6 flex items-start justify-between">
                          <span className="rounded-xl bg-[#282828] p-3">
                            <Sparkles size={18} />
                          </span>
                          <DialogClose
                            className="rounded-full p-1.5 text-[#999] hover:bg-white/10 hover:text-white"
                            aria-label="关闭对话框"
                          >
                            <X size={16} />
                          </DialogClose>
                        </div>
                        <DialogTitle className="font-display text-[24px] font-medium text-white">
                          同一种视觉语言
                        </DialogTitle>
                        <DialogDescription className="mt-3 text-[13px] leading-6 text-[#999]">
                          浮层沿用暗色表面与细边线。焦点由 Base UI 管理，按 Escape
                          或点击背景即可关闭。
                        </DialogDescription>
                        <div className="mt-7 flex justify-end">
                          <DialogClose className="ds-button ds-button-primary inline-flex h-8 items-center rounded-full px-3">
                            完成
                          </DialogClose>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </Card>
                  <Card className="p-6">
                    <h3 className="mb-3 text-[15px] font-medium">Accordion</h3>
                    <Accordion defaultValue={["one"]} className="divide-y divide-white/[.07]">
                      <AccordionItem value="one">
                        <AccordionHeader>
                          <AccordionTrigger>
                            为什么使用 Base UI？
                            <ChevronDown size={16} className="text-[#888]" />
                          </AccordionTrigger>
                        </AccordionHeader>
                        <AccordionPanel>
                          <div className="pb-4">
                            它提供可访问的交互行为与键盘支持，视觉完全由本地组件控制。
                          </div>
                        </AccordionPanel>
                      </AccordionItem>
                      <AccordionItem value="two">
                        <AccordionHeader>
                          <AccordionTrigger>
                            如何使用这些 token？
                            <ChevronDown size={16} className="text-[#888]" />
                          </AccordionTrigger>
                        </AccordionHeader>
                        <AccordionPanel>
                          <div className="pb-4">
                            以 DESIGN.md 为规范，Tailwind 主题变量为实现层，组件复用这些变量。
                          </div>
                        </AccordionPanel>
                      </AccordionItem>
                      <AccordionItem value="three">
                        <AccordionHeader>
                          <AccordionTrigger>
                            动效如何兼顾可访问性？
                            <ChevronDown size={16} className="text-[#888]" />
                          </AccordionTrigger>
                        </AccordionHeader>
                        <AccordionPanel>
                          <div className="pb-4">
                            尊重系统减少动态效果偏好；保留颜色与文字状态，使状态不依赖位移表达。
                          </div>
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
                  </Card>
                </div>
              </TabsPanel>
            </Tabs>
          </section>

          <section id="forms" className="scroll-mt-20 pb-20">
            <SectionHead
              index="04 / FORMS"
              title="表单组件"
              description="从字段标签到错误提示，把输入、选择与提交放在同一个可操作的预览中。"
            />
            <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
              <Card className="p-5 md:p-7">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[15px] font-medium text-white">联系表单</h3>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">
                      填写并提交，查看交互反馈
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-[var(--color-subtle)]">
                    LIVE PREVIEW
                  </span>
                </div>
                <form
                  className="space-y-5"
                  onSubmit={(event) => {
                    event.preventDefault();
                    showNotice("表单预览 · 已提交");
                  }}
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="form-name" className="block text-[13px] font-medium">
                        姓名
                      </label>
                      <Input
                        id="form-name"
                        name="name"
                        autoComplete="name"
                        placeholder="如何称呼你"
                        required
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="form-email" className="block text-[13px] font-medium">
                        邮箱
                      </label>
                      <Input
                        id="form-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="name@example.com"
                        required
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Select items={contactTopics} name="topic">
                      <div className="space-y-2">
                        <SelectLabel className="block text-[13px] font-medium">
                          咨询类型
                        </SelectLabel>
                        <SelectTrigger>
                          <SelectValue placeholder="选择咨询类型" />
                        </SelectTrigger>
                      </div>
                      <SelectContent>
                        {contactTopics.map(({ label, value }) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="space-y-2">
                      <label htmlFor="form-technology" className="block text-[13px] font-medium">
                        相关技术
                      </label>
                      <Combobox items={technologies} name="technology">
                        <ComboboxInputGroup>
                          <ComboboxInput id="form-technology" placeholder="搜索或选择技术" />
                          <ComboboxClear />
                          <ComboboxTrigger />
                        </ComboboxInputGroup>
                        <ComboboxContent>
                          <ComboboxList className="max-h-60 overflow-y-auto p-1">
                            {(item: string) => (
                              <ComboboxItem key={item} value={item}>
                                {item}
                              </ComboboxItem>
                            )}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="form-message" className="block text-[13px] font-medium">
                      留言
                    </label>
                    <Textarea
                      id="form-message"
                      name="message"
                      placeholder="写下你的想法"
                      required
                    />
                    <p className="text-[11px] text-[var(--color-muted)]">
                      支持多行输入，可拖动右下角调整高度。
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/[.07] pt-5">
                    <div className="flex items-center gap-3">
                      <Switch id="form-updates" aria-label="接收后续更新" defaultChecked />
                      <label htmlFor="form-updates" className="cursor-pointer text-[13px]">
                        接收后续更新
                      </label>
                    </div>
                    <Button type="submit" variant="primary">
                      提交预览 <ArrowRight size={14} aria-hidden="true" />
                    </Button>
                  </div>
                </form>
              </Card>
              <Card className="p-6">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[15px] font-medium text-white">输入状态</h3>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">默认、错误与禁用</p>
                  </div>
                  <span className="font-mono text-[10px] text-[var(--color-subtle)]">
                    INPUT / STATES
                  </span>
                </div>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="state-default" className="block text-[13px] font-medium">
                      默认
                    </label>
                    <Input id="state-default" placeholder="点击或按 Tab 聚焦" className="w-full" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="state-error" className="block text-[13px] font-medium">
                      错误
                    </label>
                    <Input
                      id="state-error"
                      type="email"
                      defaultValue="invalid-email"
                      aria-invalid="true"
                      aria-describedby="state-error-message"
                      className="w-full"
                    />
                    <p id="state-error-message" className="text-[11px] text-[var(--color-danger)]">
                      请输入有效的邮箱地址。
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="state-disabled"
                      className="block text-[13px] font-medium text-[var(--color-muted)]"
                    >
                      禁用
                    </label>
                    <Input id="state-disabled" value="暂不可编辑" disabled className="w-full" />
                  </div>
                </div>
                <p className="mt-6 border-t border-white/[.07] pt-5 text-[12px] leading-6 text-[var(--color-muted)]">
                  字段保留可见标签；错误同时使用文字与底部标记，键盘焦点使用独立的蓝色轮廓。
                </p>
              </Card>
            </div>
            <Card className="mt-6 p-6">
              <h3 className="text-[15px] font-medium">组合输入框</h3>
              <p className="mt-1 mb-5 text-xs text-[var(--color-muted)]">
                图标、输入区与操作按钮共享完整外框。
              </p>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="group-search" className="block text-[13px] font-medium">
                    搜索与清空
                  </label>
                  <InputGroup>
                    <InputGroupInput
                      id="group-search"
                      placeholder="输入关键词…"
                      value={searchPreview}
                      onChange={(event) => setSearchPreview(event.target.value)}
                    />
                    <InputGroupAddon>
                      <Search size={16} aria-hidden="true" />
                    </InputGroupAddon>
                    {searchPreview && (
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          aria-label="清空预览搜索"
                          onClick={() => {
                            setSearchPreview("");
                            document.getElementById("group-search")?.focus();
                          }}
                        >
                          <X size={16} aria-hidden="true" />
                        </InputGroupButton>
                      </InputGroupAddon>
                    )}
                  </InputGroup>
                </div>
                <div className="space-y-2">
                  <label htmlFor="group-icon" className="block text-[13px] font-medium">
                    带图标
                  </label>
                  <InputGroup>
                    <InputGroupInput id="group-icon" placeholder="点击图标或按 Tab 聚焦" />
                    <InputGroupAddon>
                      <Search size={16} aria-hidden="true" />
                    </InputGroupAddon>
                  </InputGroup>
                </div>
                <div className="space-y-2">
                  <label htmlFor="group-error" className="block text-[13px] font-medium">
                    错误
                  </label>
                  <InputGroup>
                    <InputGroupInput
                      id="group-error"
                      defaultValue="无效条件"
                      aria-invalid="true"
                      aria-describedby="group-error-message"
                    />
                    <InputGroupAddon>
                      <Search size={16} aria-hidden="true" />
                    </InputGroupAddon>
                  </InputGroup>
                  <p id="group-error-message" className="text-[11px] text-[var(--color-danger)]">
                    请输入有效的搜索条件。
                  </p>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="group-disabled"
                    className="block text-[13px] font-medium text-[var(--color-muted)]"
                  >
                    禁用
                  </label>
                  <InputGroup>
                    <InputGroupInput id="group-disabled" value="暂不可搜索" disabled />
                    <InputGroupAddon>
                      <Search size={16} aria-hidden="true" />
                    </InputGroupAddon>
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton aria-label="清空禁用搜索" disabled>
                        <X size={16} aria-hidden="true" />
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                </div>
              </div>
            </Card>
          </section>

          <section id="motion" className="scroll-mt-20 pb-20">
            <SectionHead
              index="05 / MOTION"
              title="动效语言"
              description="快而轻的操作反馈，慢而柔的氛围演示。节奏有差别，视觉体验才有呼吸。"
            />
            <div className="mb-5 flex items-center justify-between">
              <span className="flex items-center gap-2 text-[12px] text-[#999]">
                <span className="h-2 w-2 rounded-full bg-[#73d6a1] shadow-[0_0_8px_#73d6a1]" />
                实时动效预览
              </span>
              <Button size="sm" onClick={() => setReplay(replay + 1)}>
                <RotateCcw size={13} /> 重新播放
              </Button>
            </div>
            <div key={replay} className="grid gap-4 md:grid-cols-3">
              <DemoCard
                kind="beam"
                title="Border beam"
                caption="沿边界移动 / loop"
                selected={selectedEffect === "beam"}
                playing={selectedEffect === "beam" && motion && !reducedMotion}
                onSelect={() => setSelectedEffect("beam")}
              />
              <DemoCard
                kind="orb"
                title="Thinking orb"
                caption="低对比度呼吸 / loop"
                selected={selectedEffect === "orb"}
                playing={selectedEffect === "orb" && motion && !reducedMotion}
                onSelect={() => setSelectedEffect("orb")}
              />
              <DemoCard kind="lift" title="Micro lift" caption="上浮 6px / 350ms" />
            </div>
            <Card className="mt-4 flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-[13px] font-medium text-white">指针反馈</h3>
                <p className="mt-1 text-[11px] text-[#999]">
                  移过空白、按钮与输入框，观察箭头、圆环和文本光标。
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button size="sm" onClick={() => showNotice("指针按钮 · 已触发")}>
                  悬停或点击
                </Button>
                <Input
                  type="text"
                  aria-label="指针文本状态演示"
                  placeholder="在这里输入文字"
                  className="w-full sm:w-52"
                />
              </div>
            </Card>
            <div className="mt-4 grid gap-4 rounded-[18px] border border-white/[.06] bg-[#181818] p-5 sm:grid-cols-4">
              {[
                ["80ms", "Micro"],
                ["150ms", "Quick"],
                ["250ms", "Standard"],
                ["350ms", "Expressive"],
              ].map(([duration, label]) => (
                <div
                  key={label}
                  className="flex items-center gap-3 sm:border-r sm:border-white/[.07] sm:last:border-r-0"
                >
                  <span className="font-display text-[22px] text-white">{duration}</span>
                  <span className="font-mono text-[10px] text-[#888] uppercase">{label}</span>
                </div>
              ))}
            </div>
          </section>

          <section id="guidelines" className="scroll-mt-20">
            <SectionHead
              index="06 / IMPLEMENTATION"
              title="从规范到组件"
              description="设计规则被写入仓库，作为之后所有页面和组件的共同依据。"
            />
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="p-6">
                <div className="mb-5 flex items-center gap-2">
                  <Code2 size={18} />
                  <h3 className="text-[15px] font-medium">组件组织</h3>
                </div>
                <div className="space-y-2 font-mono text-[12px]">
                  {[
                    ["DESIGN.md", "规范来源"],
                    ["app/globals.css", "Tailwind theme"],
                    ["components/ui/*", "Base UI + 样式"],
                  ].map(([path, role]) => (
                    <div key={path} className="flex justify-between rounded-lg bg-[#111] px-4 py-3">
                      <span>/ {path}</span>
                      <span className="text-[#777]">{role}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-6">
                <div className="mb-5 flex items-center gap-2">
                  <Sparkles size={18} />
                  <h3 className="text-[15px] font-medium">设计原则</h3>
                </div>
                <ul className="space-y-3 text-[13px] leading-6 text-[#999]">
                  <li>✓ 让深色表面保持安静，仅在交互时提亮。</li>
                  <li>✓ 每个状态都有颜色、语义和焦点反馈。</li>
                  <li>✓ 尊重系统减少动态效果偏好。</li>
                </ul>
              </Card>
            </div>
          </section>
          <footer className="mt-20 flex flex-wrap justify-between gap-3 border-t border-white/[.07] pt-6 text-[11px] text-[#777]">
            <span>Fuxiaochen Afterglow · Design system v1.0</span>
            <span>
              参考{" "}
              <a
                href="https://libraries.dev/"
                target="_blank"
                rel="noreferrer"
                className="text-[#aaa] hover:underline"
              >
                Libraries.dev
              </a>{" "}
              的设计语言与开源实现
            </span>
          </footer>
        </main>
      </div>
      {notice && (
        <output className="fixed right-5 bottom-5 z-50 flex items-center gap-2 rounded-full border border-white/10 bg-[#252525] px-4 py-2.5 text-[12px] text-white shadow-xl">
          <Check size={14} className="text-[#73d6a1]" />
          {notice}
        </output>
      )}
    </div>
  );
}
