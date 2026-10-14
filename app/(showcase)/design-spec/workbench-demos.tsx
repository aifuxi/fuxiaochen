"use client";

import type { ReactNode } from "react";

import { BorderBeam } from "border-beam";
import { ArrowRight, Check, ChevronDown, Layers3, RotateCcw, Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ThinkingOrb } from "thinking-orbs";

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ColorInput } from "@/components/ui/color-input";
import {
  Combobox,
  ComboboxClear,
  ComboboxInput,
  ComboboxInputGroup,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsPanel, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import { ComboboxContent, DialogContent, SelectContent } from "./preview-components";

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
type NoticeProps = { onNotice: (message: string) => void };

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}

function Rule({ children }: { children: ReactNode }) {
  return <p className="workbench-rule">{children}</p>;
}

function TopicSelect({
  id,
  label,
  disabled = false,
  compact = false,
  name,
}: {
  id: string;
  label: string;
  disabled?: boolean;
  compact?: boolean;
  name?: string;
}) {
  return (
    <div className="space-y-2">
      <Select
        items={contactTopics}
        defaultValue={contactTopics[0].value}
        disabled={disabled}
        name={name}
      >
        <SelectLabel className="block text-sm font-medium">{label}</SelectLabel>
        <SelectTrigger id={id} size={compact ? "compact" : "default"}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {contactTopics.map(({ label: option, value }) => (
            <SelectItem key={value} value={value}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function TechnologyCombobox({
  id,
  label,
  disabled = false,
  name,
}: {
  id: string;
  label: string;
  disabled?: boolean;
  name?: string;
}) {
  return (
    <Field id={id} label={label}>
      <Combobox items={technologies} disabled={disabled} name={name}>
        <ComboboxInputGroup>
          <ComboboxInput id={id} placeholder="搜索或选择技术" />
          <ComboboxClear aria-label={`清空${label}`} />
          <ComboboxTrigger aria-label={`展开${label}`} />
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
    </Field>
  );
}

function ButtonsDemo({ onNotice }: NoticeProps) {
  return (
    <div className="workbench-stack">
      <section className="workbench-sample">
        <h2 className="mb-5 text-lg font-semibold">可操作样本</h2>
        <div className="workbench-stage">
          <div className="workbench-row">
            <Button variant="primary" onClick={() => onNotice("主要操作已触发")}>
              主要操作 <ArrowRight size={16} aria-hidden="true" />
            </Button>
            <Button onClick={() => onNotice("次要操作已触发")}>次要操作</Button>
            <Button variant="ghost" onClick={() => onNotice("轻量操作已触发")}>
              轻量操作
            </Button>
          </div>
        </div>
        <p className="workbench-caption">使用鼠标悬停、按下，或按 Tab 查看键盘焦点。</p>
      </section>
      <section className="workbench-sample">
        <h2 className="mb-5 text-lg font-semibold">尺寸与禁用状态</h2>
        <div className="workbench-row">
          <Button size="sm" onClick={() => onNotice("小型按钮已触发")}>
            小型操作
          </Button>
          <Button size="compact" onClick={() => onNotice("工具栏操作已触发")}>
            工具栏操作
          </Button>
          <Button size="form" variant="primary" onClick={() => onNotice("表单操作已触发")}>
            表单操作
          </Button>
          <Button disabled>暂不可用</Button>
        </div>
        <p className="workbench-caption mt-4">
          禁用样本不可操作；触屏下所有按钮保留至少 44px 的触达高度。
        </p>
      </section>
      <Rule>
        按钮圆角
        8px。蓝色用于当前主要操作，灰色用于次要操作；每次点击都有明确反馈。键盘焦点使用独立的 2px
        蓝色轮廓。
      </Rule>
    </div>
  );
}

function CardsDemo({ onNotice }: NoticeProps) {
  return (
    <div className="workbench-stack">
      <div className="workbench-grid">
        <Card className="p-6">
          <p className="workbench-state-label mb-5">静态内容样本</p>
          <Layers3 size={24} className="mb-5 text-[var(--color-muted)]" aria-hidden="true" />
          <h2 className="text-lg font-semibold">设计规范</h2>
          <p className="workbench-note mt-2">用一层平实表面承载标题与说明，内容决定卡片高度。</p>
        </Card>
        <Card className="p-6">
          <p className="workbench-state-label mb-5">含独立操作</p>
          <h2 className="text-lg font-semibold">交互预览</h2>
          <p className="workbench-note mt-2 mb-6">
            卡片本身不可点击，操作集中在有明确标签的按钮上。
          </p>
          <Button onClick={() => onNotice("卡片操作已触发")}>
            体验操作 <ArrowRight size={16} aria-hidden="true" />
          </Button>
        </Card>
      </div>
      <Rule>
        普通卡片圆角 16px，内边距 24px。信息卡不添加虚假 hover
        或点击反馈；循环动画集中在「效果舞台」。
      </Rule>
    </div>
  );
}

function InputsDemo({ onNotice }: NoticeProps) {
  return (
    <div className="workbench-stack">
      <section className="workbench-sample">
        <h2 className="mb-5 text-lg font-semibold">可操作样本</h2>
        <div className="workbench-fieldgrid">
          <Field id="input-default" label="文本输入">
            <Input id="input-default" placeholder="点击或按 Tab 聚焦" className="w-full" />
          </Field>
          <Field id="input-color" label="颜色选择">
            <ColorInput id="input-color" defaultValue="#0066df" />
          </Field>
          <div className="sm:col-span-2">
            <Field id="input-textarea" label="多行文本">
              <Textarea id="input-textarea" placeholder="写下你的想法，可拖动右下角调整高度" />
            </Field>
          </div>
        </div>
      </section>
      <section className="workbench-sample">
        <h2 className="mb-2 text-lg font-semibold">状态样本</h2>
        <p className="workbench-caption mb-5">
          错误样本保持错误提示，用于观察聚焦后的样式；可恢复的演示见「错误与恢复」。
        </p>
        <div className="workbench-fieldgrid">
          <Field id="input-error" label="错误">
            <Input
              id="input-error"
              type="email"
              defaultValue="invalid-email"
              aria-invalid="true"
              aria-describedby="input-error-message"
              className="w-full"
            />
            <p id="input-error-message" className="text-xs text-[var(--color-danger)]">
              请输入有效的邮箱地址。
            </p>
          </Field>
          <Field id="input-disabled" label="禁用">
            <Input id="input-disabled" value="暂不可编辑" disabled className="w-full" />
          </Field>
        </div>
      </section>
      <DensityDemo onNotice={onNotice} />
      <Rule>
        字段保留可见标签与 12px 圆角；输入高度桌面 40px，紧凑工具栏 36px，触屏
        44px。用填充底色区分输入区域，错误通过文字说明，键盘焦点按需显示。
      </Rule>
    </div>
  );
}

function DensityDemo({ onNotice }: NoticeProps) {
  return (
    <section className="workbench-sample">
      <h2 className="mb-5 text-lg font-semibold">尺寸与密度</h2>
      <div className="workbench-fieldgrid">
        <div className="space-y-3">
          <Field id="density-default" label="普通表单 · 40px">
            <Input id="density-default" placeholder="默认输入框" className="w-full" />
          </Field>
          <Button size="form" onClick={() => onNotice("普通表单操作已触发")}>
            表单操作
          </Button>
        </div>
        <div className="space-y-3">
          <Field id="density-compact" label="筛选工具栏 · 36px">
            <InputGroup size="compact">
              <InputGroupInput id="density-compact" placeholder="紧凑搜索框" />
              <InputGroupAddon>
                <Search size={16} aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  aria-label="执行紧凑搜索"
                  onClick={() => onNotice("紧凑搜索已触发")}
                >
                  <ArrowRight size={16} aria-hidden="true" />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </Field>
          <TopicSelect id="density-select" label="紧凑选择" compact />
        </div>
      </div>
    </section>
  );
}

function SelectionDemo() {
  return (
    <div className="workbench-stack">
      <section className="workbench-sample">
        <h2 className="mb-5 text-lg font-semibold">可操作样本</h2>
        <div className="workbench-fieldgrid">
          <TopicSelect id="selection-topic" label="固定选项" />
          <TechnologyCombobox id="selection-technology" label="搜索与选择" />
        </div>
        <p className="workbench-caption mt-5">
          选择后显示当前值；在搜索框输入不存在的关键词可查看空结果。
        </p>
      </section>
      <section className="workbench-sample">
        <h2 className="mb-5 text-lg font-semibold">禁用样本</h2>
        <div className="workbench-fieldgrid">
          <TopicSelect id="selection-disabled" label="不可更改的选项" disabled />
          <TechnologyCombobox id="combobox-disabled" label="不可搜索的选项" disabled />
        </div>
      </section>
      <Rule>
        固定选项使用 Select，可搜索列表使用 Combobox。使用方向键选择、Enter 确认、Escape
        关闭；浮层沿用本页字体、颜色与圆角。
      </Rule>
    </div>
  );
}

function SwitchDemo() {
  const [enabled, setEnabled] = useState(false);
  return (
    <div className="workbench-stack">
      <section className="workbench-sample">
        <div className="flex items-center justify-between gap-6">
          <div>
            <label
              htmlFor="notification-preview"
              className="cursor-[var(--cursor-action)] text-sm font-medium"
            >
              通知预览
            </label>
            <output className="workbench-caption mt-2 block">
              {enabled ? "通知预览已开启" : "通知预览已关闭"}
            </output>
          </div>
          <Switch
            id="notification-preview"
            touchTarget
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>
      </section>
      <section className="workbench-sample">
        <h2 className="mb-5 text-lg font-semibold">禁用样本</h2>
        <div className="workbench-row">
          <Switch id="switch-disabled" touchTarget disabled />
          <label htmlFor="switch-disabled" className="text-sm text-[var(--color-muted)]">
            暂不可更改
          </label>
        </div>
      </section>
      <Rule>
        开关仅控制这个本地预览。状态文字同步更新；Space 切换，Tab 移动焦点。开关轨道保留胶囊轮廓。
      </Rule>
    </div>
  );
}

function TabsDemo() {
  return (
    <div className="workbench-stack">
      <section className="workbench-sample">
        <Tabs defaultValue="preview">
          <TabsList aria-label="标签页演示">
            <TabsTrigger value="preview">预览</TabsTrigger>
            <TabsTrigger value="usage">用法</TabsTrigger>
            <TabsTrigger value="disabled" disabled>
              禁用
            </TabsTrigger>
          </TabsList>
          <TabsPanel value="preview">
            <h2 className="mb-2 text-lg font-semibold">预览面板</h2>
            <p className="workbench-note">
              点击「用法」切换面板，或用左右方向键移动焦点、Enter 确认。
            </p>
          </TabsPanel>
          <TabsPanel value="usage">
            <h2 className="mb-2 text-lg font-semibold">用法面板</h2>
            <p className="workbench-note">
              相关内容共用一组标签页，始终显示一个面板；禁用项不能选中。
            </p>
          </TabsPanel>
        </Tabs>
      </section>
      <Rule>
        选中项通过灰色底面和明亮文字区分，指示器随选中项移动。减少动态效果时直接更新状态。
      </Rule>
    </div>
  );
}

function AccordionDemo() {
  const items = [
    ["base-ui", "为什么使用 Base UI？", "它提供可访问的交互行为与键盘支持，视觉由本地组件控制。"],
    [
      "tokens",
      "本页的 token 会影响其他页面吗？",
      "试验值只应用于 design-spec 页面和它的浮层。全站共享设计仍以 DESIGN.md 为准。",
    ],
    [
      "motion",
      "动效如何兼顾可访问性？",
      "尊重系统减少动态效果偏好，保留颜色与文字反馈，使状态不依赖位移表达。",
    ],
  ];
  return (
    <div className="workbench-stack">
      <section className="workbench-sample">
        <Accordion defaultValue={["base-ui"]}>
          {items.map(([value, title, content]) => (
            <AccordionItem key={value} value={value}>
              <AccordionHeader>
                <AccordionTrigger>
                  {title}
                  <ChevronDown
                    size={16}
                    className="ds-accordion-chevron shrink-0 text-[var(--color-muted)]"
                    aria-hidden="true"
                  />
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionPanel>
                <div className="pb-4">{content}</div>
              </AccordionPanel>
            </AccordionItem>
          ))}
          <AccordionItem value="disabled" disabled>
            <AccordionHeader>
              <AccordionTrigger>
                禁用示例
                <ChevronDown size={16} aria-hidden="true" />
              </AccordionTrigger>
            </AccordionHeader>
          </AccordionItem>
        </Accordion>
      </section>
      <Rule>
        标题同时承担开关，不额外增加按钮。Enter 或 Space
        展开与收起；内容随高度自然展开，不固定裁切。
      </Rule>
    </div>
  );
}

function DialogDemo({ onNotice }: NoticeProps) {
  return (
    <div className="workbench-stack">
      <section className="workbench-sample workbench-stage">
        <Dialog>
          <DialogTrigger render={<Button />}>
            打开对话框 <ArrowRight size={16} aria-hidden="true" />
          </DialogTrigger>
          <DialogContent>
            <div className="flex items-start justify-between gap-4">
              <DialogTitle className="text-lg leading-[26px] font-semibold">对话框预览</DialogTitle>
              <DialogClose
                render={
                  <Button
                    variant="ghost"
                    className="h-11 w-11 shrink-0 p-0"
                    aria-label="关闭对话框"
                  />
                }
                aria-label="关闭对话框"
              >
                <X size={18} aria-hidden="true" />
              </DialogClose>
            </div>
            <DialogDescription className="mt-3 text-sm leading-[22px] text-[var(--color-foreground-reading)]">
              浮层沿用本页的设计试验值。按 Escape 或点击背景可关闭，焦点将返回打开按钮。
            </DialogDescription>
            <div className="mt-6 space-y-2">
              <label htmlFor="dialog-note" className="block text-sm font-medium">
                备注（选填）
              </label>
              <Input id="dialog-note" placeholder="体验浮层中的输入框" className="w-full" />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <DialogClose render={<Button />}>取消</DialogClose>
              <DialogClose
                render={<Button variant="primary" />}
                onClick={() => onNotice("对话框预览已完成")}
              >
                完成
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </section>
      <Rule>
        对话框圆角
        16px，使用不透明表面和一层柔和阴影。焦点限制在浮层内，关闭后回到触发点；背景遮罩不使用模糊材质。
      </Rule>
    </div>
  );
}

function ContactDemo({ onNotice }: NoticeProps) {
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="workbench-stack">
      <section className="workbench-sample">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">联系表单预览</h2>
          <p className="workbench-caption mt-2">标注「必填」的字段需填写；提交仅展示本地反馈。</p>
        </div>
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(true);
            onNotice("表单预览已提交，未发送数据");
          }}
          onChange={() => setSubmitted(false)}
        >
          <div className="workbench-fieldgrid">
            <Field id="contact-name" label="姓名（必填）">
              <Input
                id="contact-name"
                name="name"
                autoComplete="name"
                required
                placeholder="怎么称呼你"
                className="w-full"
              />
            </Field>
            <Field id="contact-email" label="邮箱（必填）">
              <Input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                className="w-full"
              />
            </Field>
            <TopicSelect id="contact-topic" name="topic" label="咨询类型（选填）" />
            <TechnologyCombobox
              id="contact-technology"
              name="technology"
              label="相关技术（选填）"
            />
          </div>
          <Field id="contact-message" label="留言（必填）">
            <Textarea id="contact-message" name="message" placeholder="写下你的想法" required />
          </Field>
          <div className="flex flex-wrap items-center justify-between gap-5 pt-5">
            <div className="flex items-center gap-3">
              <Switch id="contact-updates" name="updates" touchTarget defaultChecked />
              <label htmlFor="contact-updates" className="cursor-[var(--cursor-action)] text-sm">
                接收后续更新（选填）
              </label>
            </div>
            <Button type="submit" variant="primary" size="form">
              提交预览 <ArrowRight size={16} aria-hidden="true" />
            </Button>
          </div>
          {submitted && (
            <output className="flex items-center gap-2 text-sm text-[var(--color-success)]">
              <Check size={16} aria-hidden="true" />
              预览提交成功，表单内容保留在当前页面。
            </output>
          )}
        </form>
      </section>
      <Rule>
        每个字段都有可见标签。原生必填与邮箱格式校验先于提交；桌面两列，窄屏单列，表单随内容增长。
      </Rule>
    </div>
  );
}

function InputGroupDemo({ onNotice }: NoticeProps) {
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  return (
    <div className="workbench-stack">
      <section className="workbench-sample">
        <h2 className="mb-5 text-lg font-semibold">可操作样本</h2>
        <div className="workbench-fieldgrid">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              onNotice(search.trim() ? `搜索预览：${search.trim()}` : "请输入搜索关键词");
            }}
          >
            <Field id="group-search" label="搜索与清空">
              <InputGroup>
                <InputGroupInput
                  ref={searchRef}
                  id="group-search"
                  placeholder="输入关键词…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <InputGroupAddon>
                  <Search size={16} aria-hidden="true" />
                </InputGroupAddon>
                {search && (
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      aria-label="清空预览搜索"
                      onClick={() => {
                        setSearch("");
                        searchRef.current?.focus();
                      }}
                    >
                      <X size={16} aria-hidden="true" />
                    </InputGroupButton>
                  </InputGroupAddon>
                )}
                <InputGroupAddon align="inline-end">
                  <InputGroupButton type="submit" aria-label="执行预览搜索">
                    <ArrowRight size={16} aria-hidden="true" />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </Field>
          </form>
          <Field id="group-icon" label="带图标">
            <InputGroup>
              <InputGroupInput id="group-icon" placeholder="点击图标或按 Tab 聚焦" />
              <InputGroupAddon>
                <Search size={16} aria-hidden="true" />
              </InputGroupAddon>
            </InputGroup>
          </Field>
        </div>
      </section>
      <section className="workbench-sample">
        <h2 className="mb-5 text-lg font-semibold">状态样本</h2>
        <div className="workbench-fieldgrid">
          <Field id="group-error" label="错误（固定状态）">
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
            <p id="group-error-message" className="text-xs text-[var(--color-danger)]">
              请输入有效的搜索条件。
            </p>
          </Field>
          <Field id="group-disabled" label="禁用">
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
          </Field>
        </div>
      </section>
      <Rule>图标、输入与操作共享一块填充表面。清空后焦点回到输入框；附加按钮有独立焦点。</Rule>
    </div>
  );
}

function TimingDemo() {
  const [positions, setPositions] = useState<Record<string, boolean>>({});
  const timings = [
    ["80", "即时反馈", "按下与释放"],
    ["150", "快速反馈", "颜色与悬停"],
    ["250", "常规切换", "面板与选中项"],
    ["350", "展示反馈", "有意触发的表面位移"],
  ];
  return (
    <div className="workbench-stack">
      <div className="workbench-grid">
        {timings.map(([duration, label, use]) => (
          <section key={duration} className="workbench-sample">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-base font-medium">{label}</h2>
              <span className="font-mono text-sm">{duration}ms</span>
            </div>
            <p className="workbench-caption mt-2">{use}</p>
            <div className="my-8 h-6 w-32 rounded-full bg-[var(--color-raised)]" aria-hidden="true">
              <span
                className="block h-6 w-6 rounded-full bg-[var(--color-primary)] transition-transform ease-out motion-reduce:transition-none"
                style={{
                  transitionDuration: `${duration}ms`,
                  transform: positions[duration] ? "translateX(104px)" : "translateX(0)",
                }}
              />
            </div>
            <Button
              size="compact"
              onClick={() =>
                setPositions((current) => ({ ...current, [duration]: !current[duration] }))
              }
            >
              体验 {duration}ms
            </Button>
          </section>
        ))}
      </div>
      <Rule>
        点击按钮对照同一段位移的不同节奏。普通操作优先
        80–150ms，展示动作按需使用更长节奏；减少动态效果时直接更新终点。
      </Rule>
    </div>
  );
}

function EffectStage({
  kind,
  playing,
  reducedMotion,
  onToggle,
  onPause,
  replay,
}: {
  kind: "beam" | "orb";
  playing: boolean;
  reducedMotion: boolean;
  onToggle: () => void;
  onPause: () => void;
  replay: number;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const title = kind === "beam" ? "Border beam" : "Thinking orb";
  useEffect(() => {
    if (!playing || !stageRef.current) return undefined;
    let observing = true;
    const observer = new IntersectionObserver(([entry]) => {
      if (observing && !entry.isIntersecting) onPause();
    });
    observer.observe(stageRef.current);
    return () => {
      observing = false;
      observer.disconnect();
    };
  }, [onPause, playing]);
  return (
    <section className="workbench-sample">
      <div ref={stageRef} className="workbench-stage">
        {kind === "beam" ? (
          <BorderBeam
            key={`${replay}-${reducedMotion}`}
            size="md"
            colorVariant="ocean"
            theme="dark"
            active={playing}
            style={{ width: 185 }}
          >
            <div className="flex h-[100px] w-[185px] items-center justify-center rounded-2xl bg-[var(--color-background)] text-sm">
              Border beam
            </div>
          </BorderBeam>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <ThinkingOrb
              key={replay}
              state="breathing"
              size={64}
              theme="dark"
              paused={!playing}
              className="pointer-events-none"
              aria-hidden="true"
            />
            <span className="workbench-caption">构思中 · 效果演示</span>
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-medium">{title}</h2>
          <p className="workbench-caption mt-1">
            {kind === "beam" ? "沿边界移动" : "柔和等待反馈"}
          </p>
        </div>
        <Button
          size="compact"
          aria-pressed={playing}
          aria-label={reducedMotion ? `${title} 静态预览` : `${playing ? "暂停" : "播放"} ${title}`}
          disabled={reducedMotion}
          onClick={onToggle}
        >
          {reducedMotion ? "静态预览" : playing ? "暂停" : "播放"}
        </Button>
      </div>
    </section>
  );
}

function EffectsDemo({ onNotice }: NoticeProps) {
  const [selected, setSelected] = useState<"beam" | "orb">("beam");
  const [playing, setPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [replay, setReplay] = useState(0);
  const pause = useCallback(() => setPlaying(false), []);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => {
      setReducedMotion(media.matches);
      if (media.matches) setPlaying(false);
    };
    const syncVisibility = () => {
      if (document.hidden) setPlaying(false);
    };
    syncMotion();
    media.addEventListener("change", syncMotion);
    document.addEventListener("visibilitychange", syncVisibility);
    return () => {
      media.removeEventListener("change", syncMotion);
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, []);
  function toggle(kind: "beam" | "orb") {
    setPlaying(selected === kind ? !playing : true);
    setSelected(kind);
  }
  return (
    <div className="workbench-stack">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <output className="workbench-caption">
          {reducedMotion
            ? "系统已启用减少动态效果，保留静态预览"
            : playing
              ? `${selected === "beam" ? "Border beam" : "Thinking orb"} 播放中`
              : "已暂停，点击播放开始预览"}
        </output>
        <Button
          size="compact"
          disabled={reducedMotion}
          onClick={() => {
            setReplay((value) => value + 1);
            setPlaying(true);
          }}
        >
          <RotateCcw size={16} aria-hidden="true" />
          重新播放
        </Button>
      </div>
      <div className="workbench-grid">
        <EffectStage
          kind="beam"
          playing={selected === "beam" && playing && !reducedMotion}
          reducedMotion={reducedMotion}
          onToggle={() => toggle("beam")}
          onPause={pause}
          replay={replay}
        />
        <EffectStage
          kind="orb"
          playing={selected === "orb" && playing && !reducedMotion}
          reducedMotion={reducedMotion}
          onToggle={() => toggle("orb")}
          onPause={pause}
          replay={replay}
        />
      </div>
      <section className="workbench-sample">
        <h2 className="text-base font-medium">Micro lift</h2>
        <p className="workbench-caption mt-1">悬停或键盘聚焦时上浮，移出后复位。</p>
        <div className="workbench-stage">
          <Button
            onClick={() => onNotice("表面上浮反馈已触发")}
            aria-label="体验表面上浮反馈"
            className="workbench-lift h-20 w-20 p-0 hover:-translate-y-1.5 focus-visible:-translate-y-1.5 active:translate-y-0 motion-reduce:translate-y-0"
          >
            <Layers3 size={26} strokeWidth={1.5} aria-hidden="true" />
          </Button>
        </div>
      </section>
      <Rule>
        一次只播放一个循环效果。舞台离屏、页面隐藏或切换目录后暂停，返回时等待再次播放；「重新播放」保留当前所选效果。
      </Rule>
    </div>
  );
}

function CursorDemo({ onNotice }: NoticeProps) {
  return (
    <div className="workbench-stack">
      <section className="workbench-sample">
        <h2 className="mb-5 text-lg font-semibold">静态造型样本</h2>
        <div className="workbench-row">
          {[
            ["default", "浏览"],
            ["action", "操作"],
            ["pressed", "按下"],
          ].map(([state, label]) => (
            <span key={state} className="mr-5 flex items-center gap-3 text-sm">
              {/* 原尺寸 SVG 指针样例也让触屏用户看见造型。 */}
              {/* oxlint-disable-next-line nextjs/no-img-element -- 原尺寸 SVG 指针样例，无需图片优化。 */}
              <img src={`/cursors/afterglow-${state}.svg`} width={28} height={28} alt="" />
              {label}
            </span>
          ))}
        </div>
      </section>
      <section className="workbench-sample">
        <h2 className="mb-5 text-lg font-semibold">真实交互区域</h2>
        <div className="workbench-row">
          <span className="workbench-note">普通浏览区域</span>
          <Button onClick={() => onNotice("指针按钮已触发")}>悬停或点击</Button>
          <Button disabled>暂不可用</Button>
        </div>
        <div className="mt-6 max-w-sm">
          <Field id="cursor-input" label="文本输入">
            <Input id="cursor-input" placeholder="在这里输入文字" className="w-full" />
          </Field>
        </div>
      </section>
      <Rule>
        浏览与操作保留不同指针，按下时压暗；可编辑文本使用文本光标。触屏不依赖悬停，按钮文字和焦点提供同等信息。
      </Rule>
    </div>
  );
}

export function WorkbenchDemo({ sectionId, onNotice }: { sectionId: string } & NoticeProps) {
  switch (sectionId) {
    case "buttons":
      return <ButtonsDemo onNotice={onNotice} />;
    case "cards":
      return <CardsDemo onNotice={onNotice} />;
    case "inputs":
      return <InputsDemo onNotice={onNotice} />;
    case "selection":
      return <SelectionDemo />;
    case "switch":
      return <SwitchDemo />;
    case "tabs":
      return <TabsDemo />;
    case "accordion":
      return <AccordionDemo />;
    case "dialog":
      return <DialogDemo onNotice={onNotice} />;
    case "contact":
      return <ContactDemo onNotice={onNotice} />;
    case "input-group":
      return <InputGroupDemo onNotice={onNotice} />;
    case "errors":
      return <ErrorStatePreview />;
    case "timing":
      return <TimingDemo />;
    case "effects":
      return <EffectsDemo onNotice={onNotice} />;
    case "cursor":
      return <CursorDemo onNotice={onNotice} />;
    default:
      return null;
  }
}

function ErrorStatePreview() {
  const [showError, setShowError] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [search, setSearch] = useState("示例搜索");
  const invalid = showError || undefined;

  function errorMessage(field: string) {
    return showError ? (
      <p id={`error-preview-${field}-message`} className="text-xs text-[var(--color-danger)]">
        错误态示例：请检查此字段。
      </p>
    ) : null;
  }

  function describedBy(field: string) {
    return showError ? `error-preview-${field}-message` : undefined;
  }

  return (
    <Card className="workbench-sample" aria-labelledby="error-preview-title">
      <h2 id="error-preview-title" className="text-lg font-medium">
        切换状态
      </h2>
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
          <label htmlFor="error-preview-invalid" className="cursor-[var(--cursor-action)] text-sm">
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
          <label htmlFor="error-preview-disabled" className="cursor-[var(--cursor-action)] text-sm">
            禁用控件
          </label>
        </div>
      </div>
      <div className="workbench-fieldgrid">
        <div className="space-y-2">
          <label htmlFor="error-preview-input" className="block text-sm font-medium">
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
          <label htmlFor="error-preview-textarea" className="block text-sm font-medium">
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
            <SelectLabel className="block text-sm font-medium">Select · 选择类型</SelectLabel>
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
          <label htmlFor="error-preview-group" className="block text-sm font-medium">
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
          <label htmlFor="error-preview-combobox" className="block text-sm font-medium">
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
          <label htmlFor="error-preview-color" className="block text-sm font-medium">
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
      <p className="mt-6 pt-5 text-[12px] leading-6 text-[var(--color-muted)]">
        错误通过字段下方的文字说明，输入保持灰色填充；键盘焦点按需显示，关闭错误后恢复正常状态。
      </p>
    </Card>
  );
}
