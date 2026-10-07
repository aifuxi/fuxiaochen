"use client";

import { BorderBeam } from "border-beam";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Code2,
  Copy,
  ExternalLink,
  Layers3,
  MousePointer2,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ThinkingOrb } from "thinking-orbs";

import { CategoryDot } from "@/components/frontend/category-dot";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardStage } from "@/components/ui/card";
import { ColorInput } from "@/components/ui/color-input";
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
    <div className="showcase-section-head">
      <div>
        <p className="mb-3 font-mono text-xs text-[var(--color-subtle)]">{index}</p>
        <h2 className="ds-heading">{title}</h2>
      </div>
      <p className="max-w-[390px] text-[13px] leading-6 text-[var(--color-muted)]">{description}</p>
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
        className="showcase-beam"
        active={active}
        style={{ width: 185 }}
      >
        <div className="flex h-[100px] w-[185px] items-center justify-center rounded-[20px] bg-[var(--color-stage)] text-[13px] text-[var(--color-foreground)]">
          Border beam
        </div>
      </BorderBeam>
    </div>
  );
}

function Orb({ paused }: { paused: boolean }) {
  return (
    <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-3">
      <ThinkingOrb
        state="breathing"
        size={64}
        theme="dark"
        paused={paused}
        className="pointer-events-none"
        aria-hidden="true"
      />
      <span className="text-[11px] text-[var(--color-muted)]">构思中</span>
    </div>
  );
}

function DemoCard({
  kind,
  title,
  caption,
  playing = false,
  playbackDisabled = false,
  onSelect,
  onPause,
  onLift,
}: {
  kind: "beam" | "orb" | "lift";
  title: string;
  caption: string;
  playing?: boolean;
  playbackDisabled?: boolean;
  onSelect?: () => void;
  onPause?: () => void;
  onLift?: () => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!playing || !stage || !onPause) return undefined;
    let observing = true;
    const observer = new IntersectionObserver(([entry]) => {
      if (observing && !entry.isIntersecting) onPause();
    });
    observer.observe(stage);
    return () => {
      observing = false;
      observer.disconnect();
    };
  }, [playing, onPause]);

  return (
    <Card className="showcase-card p-3">
      <CardStage className="min-h-[190px] overflow-hidden">
        <div ref={stageRef} className="showcase-effect-stage">
          {kind === "beam" ? (
            <Beam key={playbackDisabled ? "static" : "animated"} active={playing} />
          ) : kind === "orb" ? (
            <Orb paused={!playing} />
          ) : (
            <Button
              onClick={onLift}
              className="lift-object h-20 w-20 rounded-[var(--radius-md)]"
              aria-label="体验表面上浮反馈"
            >
              <Layers3 size={25} strokeWidth={1.5} aria-hidden="true" />
            </Button>
          )}
        </div>
      </CardStage>
      <div className="flex items-center justify-between gap-3 px-2 pt-4 pb-2">
        <div className="min-w-0">
          <h3 className="text-[13px] font-medium text-white">{title}</h3>
          <p className="mt-1 text-[11px] text-[var(--color-muted)]">{caption}</p>
        </div>
        {onSelect ? (
          <Button
            size="sm"
            onClick={onSelect}
            disabled={playbackDisabled}
            aria-pressed={playing}
            aria-label={
              playbackDisabled
                ? `${title} 静态预览，系统已启用减少动态效果`
                : playing
                  ? `暂停 ${title}`
                  : `播放 ${title}`
            }
          >
            {playbackDisabled ? "静态预览" : playing ? "暂停" : "播放"}
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

function ErrorStatePreview() {
  const [showError, setShowError] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [search, setSearch] = useState("示例搜索");
  const invalid = showError || undefined;

  function errorMessage(field: string) {
    return showError ? (
      <p id={`error-preview-${field}-message`} className="text-[11px] text-[var(--color-danger)]">
        错误态示例：请检查此字段。
      </p>
    ) : null;
  }

  function describedBy(field: string) {
    return showError ? `error-preview-${field}-message` : undefined;
  }

  return (
    <Card className="showcase-form-preview mt-6 p-6" aria-labelledby="error-preview-title">
      <h3 id="error-preview-title" className="text-[15px] font-medium">
        错误态与恢复
      </h3>
      <p className="mt-1 text-xs leading-6 text-[var(--color-muted)]">
        切换开关，对照六类控件的正常、错误和禁用状态。开关只控制本地演示，编辑字段不会触发业务校验。
      </p>
      <div className="my-5 flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-3">
          <Switch
            id="error-preview-invalid"
            checked={showError}
            onCheckedChange={setShowError}
            aria-label="显示错误"
            touchTarget
          />
          <label htmlFor="error-preview-invalid" className="cursor-pointer text-[13px]">
            显示错误
          </label>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            id="error-preview-disabled"
            checked={disabled}
            onCheckedChange={setDisabled}
            aria-label="禁用控件"
            touchTarget
          />
          <label htmlFor="error-preview-disabled" className="cursor-pointer text-[13px]">
            禁用控件
          </label>
        </div>
      </div>
      <div className="showcase-form-fields">
        <div className="space-y-2">
          <label htmlFor="error-preview-input" className="block text-[13px] font-medium">
            Input · 文本
          </label>
          <Input
            id="error-preview-input"
            defaultValue="示例文本"
            disabled={disabled}
            aria-invalid={invalid}
            aria-describedby={describedBy("input")}
            className="w-full"
          />
          {errorMessage("input")}
        </div>
        <div className="space-y-2">
          <label htmlFor="error-preview-textarea" className="block text-[13px] font-medium">
            Textarea · 多行文本
          </label>
          <Textarea
            id="error-preview-textarea"
            defaultValue="可以编辑这段多行文本。"
            disabled={disabled}
            aria-invalid={invalid}
            aria-describedby={describedBy("textarea")}
          />
          {errorMessage("textarea")}
        </div>
        <div className="space-y-2">
          <Select items={contactTopics} defaultValue={contactTopics[0].value} disabled={disabled}>
            <SelectLabel className="block text-[13px] font-medium">Select · 选择类型</SelectLabel>
            <SelectTrigger
              id="error-preview-select"
              aria-invalid={invalid}
              aria-describedby={describedBy("select")}
            >
              <SelectValue placeholder="选择咨询类型" />
            </SelectTrigger>
            <SelectContent>
              {contactTopics.map(({ label, value }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errorMessage("select")}
        </div>
        <div className="space-y-2">
          <label htmlFor="error-preview-group" className="block text-[13px] font-medium">
            InputGroup · 搜索与清空
          </label>
          <InputGroup>
            <InputGroupInput
              id="error-preview-group"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="输入关键词…"
              disabled={disabled}
              aria-invalid={invalid}
              aria-describedby={describedBy("group")}
            />
            <InputGroupAddon>
              <Search size={16} aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                aria-label="清空状态演示搜索"
                disabled={disabled}
                onClick={() => {
                  setSearch("");
                  document.getElementById("error-preview-group")?.focus();
                }}
              >
                <X size={16} aria-hidden="true" />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          {errorMessage("group")}
        </div>
        <div className="space-y-2">
          <label htmlFor="error-preview-combobox" className="block text-[13px] font-medium">
            Combobox · 搜索技术
          </label>
          <Combobox items={technologies} defaultValue={technologies[0]} disabled={disabled}>
            <ComboboxInputGroup>
              <ComboboxInput
                id="error-preview-combobox"
                placeholder="搜索或选择技术"
                aria-invalid={invalid}
                aria-describedby={describedBy("combobox")}
              />
              <ComboboxClear aria-label="清空状态演示技术" />
              <ComboboxTrigger aria-label="展开状态演示技术" />
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
          {errorMessage("combobox")}
        </div>
        <div className="space-y-2">
          <label htmlFor="error-preview-color" className="block text-[13px] font-medium">
            ColorInput · 颜色
          </label>
          <ColorInput
            id="error-preview-color"
            defaultValue="#0066df"
            disabled={disabled}
            aria-invalid={invalid}
            aria-describedby={describedBy("color")}
          />
          {errorMessage("color")}
        </div>
      </div>
      <p className="mt-6 border-t border-white/[.07] pt-5 text-[12px] leading-6 text-[var(--color-muted)]">
        错误保留灰底与均匀细内框，键盘焦点使用独立蓝色轮廓；关闭错误后恢复正常交互状态。
      </p>
    </Card>
  );
}

export default function Page() {
  const [motion, setMotion] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [selectedEffect, setSelectedEffect] = useState("motion-beam");
  const [replay, setReplay] = useState(0);
  const [notice, setNotice] = useState("");
  const [noticeStatus, setNoticeStatus] = useState<"success" | "error">("success");
  const [copied, setCopied] = useState(false);
  const [searchPreview, setSearchPreview] = useState("");
  const [notificationPreview, setNotificationPreview] = useState(false);
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pauseEffect = useCallback(() => setMotion(false), []);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      setReducedMotion(preference.matches);
      if (preference.matches) setMotion(false);
    };
    const pauseWhenHidden = () => {
      if (document.hidden) setMotion(false);
    };
    updatePreference();
    preference.addEventListener("change", updatePreference);
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => {
      preference.removeEventListener("change", updatePreference);
      document.removeEventListener("visibilitychange", pauseWhenHidden);
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  function showNotice(message: string, status: "success" | "error" = "success") {
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    setNotice(message);
    setNoticeStatus(status);
    noticeTimerRef.current = setTimeout(() => setNotice(""), 2200);
  }
  async function copyColor() {
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    setCopied(false);
    try {
      await navigator.clipboard.writeText("#0066DF");
      setCopied(true);
      copiedTimerRef.current = setTimeout(() => {
        setCopied(false);
        copiedTimerRef.current = null;
      }, 2000);
    } catch {
      showNotice("复制失败，请手动复制色值。", "error");
    }
  }
  function toggleEffect(effect: string) {
    setSelectedEffect(effect);
    setMotion(selectedEffect !== effect || !motion);
  }

  return (
    <div
      className="design-showcase min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]"
      data-motion={motion ? "on" : "off"}
      id="top"
    >
      <header className="showcase-header">
        <div className="showcase-header-inner">
          <Link href="/" className="showcase-home-link">
            fuxiaochen<span className="text-[var(--color-muted)]">.design</span>
          </Link>
          <a
            href="https://github.com/Jakubantalik/Libraries.dev"
            target="_blank"
            rel="noreferrer"
            className="showcase-reference-link"
          >
            参考源码 <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>
      </header>
      <main className="showcase-main">
        <nav aria-label="设计规范目录" className="showcase-directory">
          {nav.map(([number, label, id]) => (
            <a key={id} href={`#${id}`}>
              <span className="font-mono text-xs text-[var(--color-subtle)]">{number}</span>
              {label}
            </a>
          ))}
        </nav>
        <section id="overview" className="showcase-overview">
          <p className="mb-6 font-mono text-xs text-[var(--color-muted)]">FUXIAOCHEN AFTERGLOW</p>
          <h1 className="ds-display">安静的界面，有生命的细节。</h1>
          <p className="showcase-introduction">
            深色材质、克制的蓝色信号与清晰的交互反馈。
            <br />
            在这里探索按钮、卡片和表单的共同语言。
          </p>
          <div className="showcase-overview-actions">
            <Button
              variant="primary"
              size="sm"
              render={<a href="#components" aria-label="探索组件" />}
              nativeButton={false}
              // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- render 输出真实锚点链接，保留导航语义。
              role="link"
            >
              探索组件 <ArrowRight size={14} aria-hidden="true" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              render={<a href="#foundations" aria-label="查看设计原则" />}
              nativeButton={false}
              // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- render 输出真实锚点链接，保留导航语义。
              role="link"
            >
              查看设计原则
            </Button>
          </div>
        </section>

        <section id="foundations" className="showcase-section">
          <SectionHead
            index="02 / FOUNDATIONS"
            title="视觉基础"
            description="色彩、排版、圆角和间距先建立秩序，再由交互赋予表面生命感。"
          />
          <div className="showcase-grid showcase-grid-featured">
            <Card className="p-5 md:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-[15px] font-medium text-white">色彩体系</h3>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    灰阶材质、品牌重点与语义用色
                  </p>
                </div>
                <span className="font-mono text-[10px] text-[var(--color-subtle)]">06 TOKENS</span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {swatches.map(([name, value]) => (
                  <div
                    key={name}
                    className="overflow-hidden rounded-[14px] border border-white/[.06] bg-[var(--color-stage)]"
                  >
                    <div className="h-[92px]" style={{ background: value }} />
                    <div className="border-t border-white/[.06] px-3 py-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium">{name}</span>
                        {name === "Primary" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={copyColor}
                            aria-label="复制 Primary 色值"
                            className="h-8 w-8 p-0"
                          >
                            {copied ? (
                              <Check size={13} aria-hidden="true" />
                            ) : (
                              <Copy size={13} aria-hidden="true" />
                            )}
                          </Button>
                        )}
                      </div>
                      <p className="mt-1 font-mono text-[10px] text-[var(--color-subtle)]">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-5 md:p-6">
              <div className="mb-5 flex justify-between">
                <h3 className="text-[15px] font-medium">排版阶梯</h3>
                <span className="font-mono text-[10px] text-[var(--color-subtle)]">TYPE SCALE</span>
              </div>
              <p className="ds-display">Shape the feeling.</p>
              <p className="mt-2 font-mono text-[10px] text-[var(--color-subtle)]">
                DISPLAY / INTER / 500
              </p>
              <div className="mt-5 border-t border-white/[.06] pt-4">
                <p className="ds-body">清晰的结构，让细节更动人。</p>
                <p className="mt-1 font-mono text-[10px] text-[var(--color-subtle)]">
                  BODY / INTER / 400
                </p>
              </div>
            </Card>
            <Card className="p-5 md:p-6">
              <div className="mb-5 flex justify-between">
                <h3 className="text-[15px] font-medium">形状与间距</h3>
                <span className="font-mono text-[10px] text-[var(--color-subtle)]">RADIUS</span>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <div className="h-13 w-13 rounded-[8px] bg-[var(--color-raised)]" />
                <div className="h-13 w-13 rounded-[var(--radius-form)] bg-[var(--color-raised)]" />
                <div className="h-13 w-13 rounded-[14px] bg-[var(--color-raised)]" />
                <div className="h-13 w-13 rounded-[24px] bg-[var(--color-raised)]" />
                <div className="h-10 w-[72px] rounded-full bg-[var(--color-raised)]" />
              </div>
              <p className="mt-4 font-mono text-[10px] text-[var(--color-muted)]">
                8PX　/　12PX FORM　/　14PX　/　24PX　/　PILL
              </p>
            </Card>
            {principles.map(({ Icon, number, title, text }) => (
              <Card key={number} className="flex flex-col gap-5 p-5">
                <div className="flex justify-between">
                  <Icon size={18} strokeWidth={1.6} aria-hidden="true" />
                  <span className="font-mono text-xs text-[var(--color-subtle)]">{number}</span>
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-medium">{title}</h3>
                  <p className="text-xs leading-5 text-[var(--color-muted)]">{text}</p>
                </div>
              </Card>
            ))}
          </div>
          <Card className="showcase-color-usage mt-6 p-5 md:p-6">
            <h3 className="text-[15px] font-medium">颜色表达信息职责</h3>
            <p className="mt-2 text-[13px] leading-6 text-[var(--color-muted)]">
              灰阶建立默认层级；重点、分类与数据、真实状态分别使用局部颜色，保留文字与独立焦点。
            </p>
            <div className="showcase-color-role-grid">
              <section aria-labelledby="color-role-brand">
                <h4 id="color-role-brand">品牌与重点</h4>
                <div className="showcase-color-examples">
                  <span className="showcase-emphasis-badge">精选</span>
                  <span className="showcase-emphasis-badge">最新</span>
                </div>
                <p>重要静态标识使用 primary，无按钮阴影或悬停状态。</p>
              </section>
              <section aria-labelledby="color-role-category">
                <h4 id="color-role-category">分类与数据</h4>
                <div className="showcase-color-examples">
                  <span className="showcase-color-label">
                    <BookOpen size={16} className="text-[var(--color-focus)]" aria-hidden="true" />
                    阅读入口
                  </span>
                  <span className="showcase-color-label">
                    <CategoryDot color="#0066DF" />
                    分类色点
                  </span>
                </div>
                <div className="showcase-color-examples" aria-label="数据系列图例示例">
                  <span className="showcase-color-label">
                    <span className="showcase-series-mark" data-series="pv" aria-hidden="true" />
                    PV
                  </span>
                  <span className="showcase-color-label">
                    <span className="showcase-series-mark" data-series="uv" aria-hidden="true" />
                    UV
                  </span>
                </div>
                <p>映射保持稳定；分类色点与文字共同识别，数据系列保留图例。</p>
              </section>
              <section aria-labelledby="color-role-state">
                <h4 id="color-role-state">状态与焦点</h4>
                <div className="showcase-color-examples" aria-label="成功与错误状态示例">
                  <span className="text-[var(--color-success)]">成功状态</span>
                  <span className="text-[var(--color-danger)]">错误状态</span>
                </div>
                <label htmlFor="color-focus-example">独立键盘焦点</label>
                <Input
                  id="color-focus-example"
                  defaultValue="按 Tab 查看焦点轮廓"
                  aria-describedby="color-focus-description"
                  className="w-full"
                />
                <p id="color-focus-description">focus 轮廓独立于分类色、选中色与状态色。</p>
              </section>
            </div>
          </Card>
        </section>

        <section id="components" className="showcase-section">
          <SectionHead
            index="03 / COMPONENTS"
            title="组件与状态"
            description="本地组件负责视觉样式，Base UI 负责语义与键盘交互。下方控件都可以直接操作。"
          />
          <Tabs
            defaultValue="buttons"
            onValueChange={(value) => {
              if (value !== "cards" && selectedEffect.startsWith("cards-")) pauseEffect();
            }}
          >
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <TabsList>
                <TabsTrigger value="buttons">按钮</TabsTrigger>
                <TabsTrigger value="cards">卡片</TabsTrigger>
                <TabsTrigger value="controls">控件</TabsTrigger>
                <TabsTrigger value="disabled-example" disabled>
                  禁用
                </TabsTrigger>
              </TabsList>
              <span className="font-mono text-[10px] text-[var(--color-subtle)]">
                INTERACTIVE PREVIEW
              </span>
            </div>
            <TabsPanel value="buttons">
              <div className="showcase-grid showcase-grid-featured">
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
                        标准按钮 <ArrowRight size={14} aria-hidden="true" />
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
                    <p className="text-[13px] leading-6 text-[var(--color-muted)]">
                      32 / 40px
                      胶囊。顶部高光、底部暗线和细内边线形成材质；悬停提亮，按下压暗，焦点环始终可见。
                    </p>
                  </div>
                  <div className="mt-6 space-y-1 border-t border-white/[.07] pt-4 font-mono text-[11px] text-[var(--color-muted)]">
                    <p className="flex justify-between">
                      <span>hover</span>
                      <span className="text-[var(--color-foreground)]">150ms / ease</span>
                    </p>
                    <p className="flex justify-between">
                      <span>focus</span>
                      <span className="text-[var(--color-foreground)]">2px / blue ring</span>
                    </p>
                    <p className="flex justify-between">
                      <span>radius</span>
                      <span className="text-[var(--color-foreground)]">full</span>
                    </p>
                  </div>
                </Card>
              </div>
            </TabsPanel>
            <TabsPanel value="cards">
              <div className="showcase-grid showcase-grid-three">
                <DemoCard
                  kind="beam"
                  title="Border beam"
                  caption="边缘流光 · Highlight"
                  playing={selectedEffect === "cards-beam" && motion && !reducedMotion}
                  playbackDisabled={reducedMotion}
                  onSelect={() => toggleEffect("cards-beam")}
                  onPause={pauseEffect}
                />
                <DemoCard
                  kind="orb"
                  title="Thinking orb"
                  caption="柔和等待反馈 · Ambient"
                  playing={selectedEffect === "cards-orb" && motion && !reducedMotion}
                  playbackDisabled={reducedMotion}
                  onSelect={() => toggleEffect("cards-orb")}
                  onPause={pauseEffect}
                />
                <DemoCard
                  kind="lift"
                  title="Surface lift"
                  caption="表面上浮 · Hover"
                  onLift={() => showNotice("表面反馈 · 已触发")}
                />
              </div>
            </TabsPanel>
            <TabsPanel value="controls">
              <div className="showcase-grid showcase-grid-featured">
                <Card className="p-6">
                  <h3 className="text-[15px] font-medium">Switch</h3>
                  <p className="mt-1 mb-6 text-xs text-[var(--color-muted)]">
                    独立状态、明确标签与可见焦点
                  </p>
                  <div className="flex items-center justify-between rounded-[14px] border border-white/[.07] bg-[var(--color-stage)] p-4">
                    <span>
                      <label
                        htmlFor="notification-preview-switch"
                        className="block cursor-pointer text-[13px] font-medium"
                      >
                        通知预览
                      </label>
                      <span className="mt-1 block text-[11px] text-[var(--color-muted)]">
                        {notificationPreview ? "通知预览已开启" : "通知预览已关闭"}
                      </span>
                    </span>
                    <Switch
                      touchTarget
                      id="notification-preview-switch"
                      aria-label="通知预览"
                      checked={notificationPreview}
                      onCheckedChange={setNotificationPreview}
                    />
                  </div>
                  <Dialog>
                    <DialogTrigger render={<Button size="sm" className="mt-5" />}>
                      打开 Dialog <ArrowRight size={14} aria-hidden="true" />
                    </DialogTrigger>
                    <DialogContent className="design-showcase-dialog">
                      <div className="mb-6 flex items-start justify-between">
                        <span className="rounded-xl bg-[var(--color-raised)] p-3">
                          <Sparkles size={18} />
                        </span>
                        <DialogClose
                          render={
                            <Button
                              variant="ghost"
                              className="h-[var(--control-touch)] w-[var(--control-touch)] p-0"
                              aria-label="关闭对话框"
                            />
                          }
                          aria-label="关闭对话框"
                        >
                          <X size={16} aria-hidden="true" />
                        </DialogClose>
                      </div>
                      <DialogTitle className="font-display text-[24px] font-medium text-white">
                        同一种视觉语言
                      </DialogTitle>
                      <DialogDescription className="mt-3 text-[13px] leading-6 text-[var(--color-muted)]">
                        浮层沿用暗色表面与细边线。焦点由 Base UI 管理，按 Escape
                        或点击背景即可关闭。
                      </DialogDescription>
                      <div className="mt-7 flex justify-end">
                        <DialogClose render={<Button variant="primary" size="sm" />}>
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
                          <ChevronDown
                            size={16}
                            className="ds-accordion-chevron text-[var(--color-muted)]"
                            aria-hidden="true"
                          />
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
                          <ChevronDown
                            size={16}
                            className="ds-accordion-chevron text-[var(--color-muted)]"
                            aria-hidden="true"
                          />
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
                          <ChevronDown
                            size={16}
                            className="ds-accordion-chevron text-[var(--color-muted)]"
                            aria-hidden="true"
                          />
                        </AccordionTrigger>
                      </AccordionHeader>
                      <AccordionPanel>
                        <div className="pb-4">
                          尊重系统减少动态效果偏好；保留颜色与文字状态，使状态不依赖位移表达。
                        </div>
                      </AccordionPanel>
                    </AccordionItem>
                    <AccordionItem value="disabled-example" disabled>
                      <AccordionHeader>
                        <AccordionTrigger>
                          禁用示例
                          <ChevronDown
                            size={16}
                            className="ds-accordion-chevron text-[var(--color-muted)]"
                            aria-hidden="true"
                          />
                        </AccordionTrigger>
                      </AccordionHeader>
                    </AccordionItem>
                  </Accordion>
                </Card>
              </div>
            </TabsPanel>
          </Tabs>
        </section>

        <section id="forms" className="showcase-section">
          <SectionHead
            index="04 / FORMS"
            title="表单组件"
            description="从字段标签到错误提示，把输入、选择与提交放在同一个可操作的预览中。"
          />
          <div className="showcase-grid showcase-grid-featured">
            <Card className="showcase-form-preview p-5 md:p-7">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[15px] font-medium text-white">联系表单</h3>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">填写并提交，查看交互反馈</p>
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
                <div className="showcase-form-fields">
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
                <div className="showcase-form-fields">
                  <Select items={contactTopics} name="topic">
                    <div className="space-y-2">
                      <SelectLabel className="block text-[13px] font-medium">咨询类型</SelectLabel>
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
                  <Textarea id="form-message" name="message" placeholder="写下你的想法" required />
                  <p className="text-[11px] text-[var(--color-muted)]">
                    支持多行输入，可拖动右下角调整高度。
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/[.07] pt-5">
                  <div className="flex items-center gap-3">
                    <Switch
                      id="form-updates"
                      aria-label="接收后续更新"
                      touchTarget
                      defaultChecked
                    />
                    <label htmlFor="form-updates" className="cursor-pointer text-[13px]">
                      接收后续更新
                    </label>
                  </div>
                  <Button type="submit" variant="primary" size="form">
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
                字段保留可见标签；错误同时使用文字与均匀细内框，键盘焦点使用独立的蓝色轮廓。
              </p>
            </Card>
          </div>
          <Card className="showcase-form-preview mt-6 p-6">
            <h3 className="text-[15px] font-medium">尺寸与密度</h3>
            <p className="mt-1 mb-5 text-xs text-[var(--color-muted)]">
              桌面表单高 40px、筛选工具栏高 36px；窄屏或触屏高 44px，表单圆角与内边距为 12px。
            </p>
            <div className="showcase-form-fields">
              <div className="space-y-3">
                <label htmlFor="density-default" className="block text-[13px] font-medium">
                  普通表单
                </label>
                <div className="flex min-w-0 items-center gap-3">
                  <Input id="density-default" placeholder="默认输入框" className="min-w-0 flex-1" />
                  <label className="sr-only" htmlFor="density-color">
                    表单颜色
                  </label>
                  <ColorInput id="density-color" defaultValue="#0066df" />
                </div>
                <Button size="form" onClick={() => showNotice("普通表单操作 · 已触发")}>
                  表单操作
                </Button>
              </div>
              <div className="space-y-3">
                <label htmlFor="density-compact" className="block text-[13px] font-medium">
                  筛选工具栏
                </label>
                <InputGroup size="compact">
                  <InputGroupInput id="density-compact" placeholder="紧凑搜索框" />
                  <InputGroupAddon>
                    <Search size={16} aria-hidden="true" />
                  </InputGroupAddon>
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      aria-label="执行紧凑搜索"
                      onClick={() => showNotice("紧凑搜索 · 已触发")}
                    >
                      <ArrowRight size={16} aria-hidden="true" />
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                <Select items={contactTopics} defaultValue={contactTopics[0].value}>
                  <SelectLabel className="sr-only">紧凑选择</SelectLabel>
                  <SelectTrigger size="compact">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contactTopics.map(({ label, value }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
          <Card className="showcase-form-preview mt-6 p-6">
            <h3 className="text-[15px] font-medium">组合输入框</h3>
            <p className="mt-1 mb-5 text-xs text-[var(--color-muted)]">
              图标、输入区与操作按钮共享完整外框。
            </p>
            <div className="showcase-form-fields">
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
          <ErrorStatePreview />
        </section>

        <section id="motion" className="showcase-section">
          <SectionHead
            index="05 / MOTION"
            title="动效语言"
            description="快而轻的操作反馈，慢而柔的氛围演示。节奏有差别，视觉体验才有呼吸。"
          />
          {reducedMotion && (
            <p className="mb-4 text-xs text-[var(--color-muted)]">
              系统已启用减少动态效果，舞台保留静态画面。
            </p>
          )}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-[12px] text-[var(--color-muted)]">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: motion ? "var(--color-focus)" : "var(--color-muted)" }}
                aria-hidden="true"
              />
              效果舞台 · {reducedMotion ? "静态预览" : motion ? "播放中" : "已暂停，点击播放"}
            </span>
            <Button
              size="sm"
              disabled={reducedMotion}
              onClick={() => {
                setReplay(replay + 1);
                setSelectedEffect(selectedEffect.endsWith("-orb") ? "motion-orb" : "motion-beam");
                setMotion(true);
              }}
            >
              <RotateCcw size={13} aria-hidden="true" /> 重新播放
            </Button>
          </div>
          <div key={replay} className="showcase-grid showcase-grid-three">
            <DemoCard
              kind="beam"
              title="Border beam"
              caption="沿边界移动 / loop"
              playing={selectedEffect === "motion-beam" && motion && !reducedMotion}
              playbackDisabled={reducedMotion}
              onSelect={() => toggleEffect("motion-beam")}
              onPause={pauseEffect}
            />
            <DemoCard
              kind="orb"
              title="Thinking orb"
              caption="低对比度呼吸 / loop"
              playing={selectedEffect === "motion-orb" && motion && !reducedMotion}
              playbackDisabled={reducedMotion}
              onSelect={() => toggleEffect("motion-orb")}
              onPause={pauseEffect}
            />
            <DemoCard
              kind="lift"
              title="Micro lift"
              caption="上浮 6px / 350ms"
              onLift={() => showNotice("表面反馈 · 已触发")}
            />
          </div>
          <Card className="mt-6 flex flex-col gap-4 p-5">
            <div>
              <h3 className="text-[13px] font-medium text-white">原生指针</h3>
              <p className="mt-1 text-[11px] text-[var(--color-muted)]">
                移过普通区域、按钮与输入框，核对系统指针、操作指针与文本光标。
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <span className="text-xs text-[var(--color-muted)]">普通区域</span>
              <Button size="sm" onClick={() => showNotice("指针按钮 · 已触发")}>
                悬停或点击
              </Button>
              <div className="space-y-2">
                <label htmlFor="native-cursor-input" className="block text-xs">
                  文本输入
                </label>
                <Input
                  type="text"
                  id="native-cursor-input"
                  placeholder="在这里输入文字"
                  className="w-full sm:w-52"
                />
              </div>
            </div>
          </Card>
          <div className="mt-6 grid gap-6 rounded-[var(--radius-lg)] border border-white/[.06] bg-[var(--color-surface)] p-5 sm:grid-cols-2 lg:grid-cols-4">
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
                <span className="font-mono text-[10px] text-[var(--color-muted)] uppercase">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section id="guidelines" className="showcase-section">
          <SectionHead
            index="06 / IMPLEMENTATION"
            title="从规范到组件"
            description="设计规则被写入仓库，作为之后所有页面和组件的共同依据。"
          />
          <div className="showcase-grid showcase-grid-featured">
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
                  <div
                    key={path}
                    className="flex justify-between rounded-lg bg-[var(--color-stage)] px-4 py-3"
                  >
                    <span>/ {path}</span>
                    <span className="text-[var(--color-subtle)]">{role}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-6">
              <div className="mb-5 flex items-center gap-2">
                <Sparkles size={18} />
                <h3 className="text-[15px] font-medium">设计原则</h3>
              </div>
              <ul className="space-y-3 text-[13px] leading-6 text-[var(--color-muted)]">
                <li>✓ 让深色表面保持安静，仅在交互时提亮。</li>
                <li>✓ 每个状态都有颜色、语义和焦点反馈。</li>
                <li>✓ 尊重系统减少动态效果偏好。</li>
              </ul>
            </Card>
          </div>
        </section>
        <footer className="mt-20 flex flex-wrap justify-between gap-3 border-t border-white/[.07] pt-6 text-[11px] text-[var(--color-subtle)]">
          <span>Fuxiaochen Afterglow · Design system v1.0</span>
          <span>
            参考{" "}
            <a
              href="https://libraries.dev/"
              target="_blank"
              rel="noreferrer"
              className="showcase-reference-link"
            >
              Libraries.dev
            </a>{" "}
            的设计语言与开源实现
          </span>
        </footer>
      </main>
      {notice && (
        <output className="showcase-notice fixed right-5 bottom-5 z-50 flex items-center gap-2 rounded-full border border-white/10 bg-[var(--color-raised)] px-4 py-2.5 text-[12px] text-white">
          {noticeStatus === "error" ? (
            <X size={14} className="shrink-0 text-[var(--color-danger)]" aria-hidden="true" />
          ) : (
            <Check size={14} className="shrink-0 text-[var(--color-success)]" aria-hidden="true" />
          )}
          {notice}
        </output>
      )}
    </div>
  );
}
