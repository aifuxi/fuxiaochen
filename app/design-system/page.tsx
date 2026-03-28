"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Palette as PaletteIcon,
  Type as TypeIcon,
  Box as BoxIcon,
  User as UserIcon,
  Table as TableIcon,
  FileText as FileTextIcon,
  Layout as LayoutIcon,
  DownloadIcon,
  BookOpenIcon,
  Plus as PlusIcon,
  Edit2 as Edit2Icon,
  Trash2 as Trash2Icon,
  MousePointerIcon,
  ZapIcon,
  SettingsIcon,
  Palette,
  Type,
  Box,
  FileText,
  Layout,
  Sparkles,
  Wand2,
  ChevronRight,
} from "lucide-react"

const navItems = [
  { id: "colors", label: "色彩系统", icon: Palette },
  { id: "typography", label: "字体系统", icon: Type },
  { id: "components", label: "组件库", icon: Box },
  { id: "avatar", label: "头像", icon: UserIcon },
  { id: "table", label: "数据表格", icon: TableIcon },
  { id: "pagination", label: "分页", icon: FileText },
  { id: "modal", label: "模态框", icon: Layout },
  { id: "animation", label: "动画规范", icon: Sparkles },
  { id: "effects", label: "特效组件", icon: Wand2 },
]

const colorSwatches = [
  { name: "Background", hex: "#050505", dark: true },
  { name: "Primary", hex: "#10b981", dark: false },
  { name: "Foreground", hex: "#EBEBEB", dark: false },
  { name: "Muted", hex: "rgba(255,255,255,0.4)", dark: false },
]

const semanticColors = [
  { name: "Success", hex: "#10b981", dark: false },
  { name: "Warning", hex: "#f59e0b", dark: false },
  { name: "Destructive", hex: "#ef4444", dark: false },
  { name: "Info", hex: "#3b82f6", dark: false },
]

const neutralColors = [
  { name: "Card", hex: "rgba(255,255,255,0.02)", dark: true },
  { name: "Secondary", hex: "rgba(255,255,255,0.08)", dark: false },
  { name: "Border", hex: "rgba(255,255,255,0.08)", dark: false },
  { name: "Input", hex: "rgba(255,255,255,0.15)", dark: false },
]

const gradients = [
  "linear-gradient(135deg, #10b981, #050505)",
  "linear-gradient(135deg, rgba(16,185,129,0.3), #050505)",
  "linear-gradient(90deg, #ebebeb, #10b981, #ebebeb)",
]

const typeScale = [
  { name: "Hero", size: "100px / 200", sample: "Aa", style: "font-serif text-[100px] font-extralight" },
  { name: "H1", size: "64px / 700", sample: "Aa", style: "font-serif text-6xl font-bold" },
  { name: "H2", size: "48px / 600", sample: "Aa", style: "font-serif text-5xl font-semibold" },
  { name: "H3", size: "24px / 500", sample: "Aa", style: "font-serif text-2xl font-medium" },
  { name: "Body Large", size: "18px / 300", sample: "Aa", style: "text-lg font-light" },
  { name: "Body", size: "16px / 400", sample: "Aa", style: "text-base" },
  { name: "Small", size: "14px / 400", sample: "Aa", style: "text-sm" },
  { name: "Label", size: "12px / 500", sample: "Aa", style: "text-xs font-mono uppercase tracking-widest" },
]

const fontWeights = [
  { name: "Light 300", weight: "font-light" },
  { name: "Regular 400", weight: "font-normal" },
  { name: "Medium 500", weight: "font-medium" },
  { name: "Semibold 600", weight: "font-semibold" },
  { name: "Bold 700", weight: "font-bold" },
]

const durations = [
  { value: "150ms", label: "Fast", desc: "Micro-interactions" },
  { value: "200ms", label: "Normal", desc: "Standard transitions" },
  { value: "300ms", label: "Slow", desc: "Panel transitions" },
  { value: "400ms", label: "Slower", desc: "Page transitions" },
  { value: "600ms", label: "Slowest", desc: "Complex animations" },
]

const tableData = [
  { title: "设计系统的未来趋势", category: "Design", status: "published", badgeVariant: "primary" as const },
  { title: "2026年Web开发路线图", category: "Development", status: "draft", badgeVariant: "secondary" as const },
  { title: "用户体验设计原则", category: "Design", status: "published", badgeVariant: "primary" as const },
]

function ColorSwatch({ name, hex, dark }: { name: string; hex: string; dark: boolean }) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(hex)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      className={`
        spotlight-card flex aspect-square cursor-pointer flex-col justify-end rounded-xl p-4 transition-transform
        hover:scale-105
      `}
      style={{ background: hex, border: dark ? "1px solid rgba(255,255,255,0.1)" : undefined }}
      onClick={handleCopy}
    >
      <div className={`
        text-sm font-medium
        ${dark ? "text-foreground" : ""}
      `}>{name}</div>
      <div className={`
        font-mono text-xs
        ${copied ? "text-primary" : "opacity-80"}
      `}>
        {copied ? "Copied!" : hex}
      </div>
    </div>
  )
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-12 text-center">
      <h2 className="mb-4 font-serif text-5xl font-semibold tracking-tight">{title}</h2>
      <p className="mx-auto max-w-xl text-lg font-light text-muted-foreground">{description}</p>
    </div>
  )
}

function SidebarNav() {
  const [activeSection, setActiveSection] = React.useState("colors")

  React.useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]")
      const scrollPos = window.scrollY + 100

      sections.forEach((section) => {
        const top = (section as HTMLElement).offsetTop
        const height = (section as HTMLElement).offsetHeight
        const id = section.getAttribute("id")

        if (scrollPos >= top && scrollPos < top + height && id) {
          setActiveSection(id)
        }
      })
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <aside className={`
      fixed top-0 bottom-0 left-0 z-40 w-[260px] overflow-y-auto border-r border-border bg-background p-6
    `}>
      <div className="mb-8">
        <div className="mb-4 font-mono text-xs tracking-widest text-muted-foreground uppercase">Design System</div>
        <div className="font-serif text-xl font-semibold text-primary italic">Chen Serif</div>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`
                flex items-center gap-3 rounded-lg border border-transparent px-4 py-3 text-sm font-medium
                transition-all
                ${activeSection === item.id
                  ? "border-border bg-secondary text-primary"
                  : `
                    text-foreground
                    hover:bg-secondary/50
                  `
                }
              `}
            >
              <Icon className="h-5 w-5 opacity-70" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="mt-8 border-t border-border pt-6">
        <div className="mb-3 font-mono text-xs tracking-widest text-muted-foreground uppercase">Resources</div>
        <button className={`
          flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-foreground transition-all
          hover:bg-secondary/50
        `}>
          <FileTextIcon className="h-5 w-5 opacity-70" />
          <span>设计文档</span>
        </button>
        <button className={`
          flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-foreground transition-all
          hover:bg-secondary/50
        `}>
          <BoxIcon className="h-5 w-5 opacity-70" />
          <span>GitHub</span>
        </button>
      </div>
    </aside>
  )
}

function HeroSection() {
  return (
    <section className="mb-12 border-b border-border pb-12">
      <div className="mb-12 text-center">
        <div className="mb-6 inline-flex items-center gap-2 font-mono text-xs tracking-widest text-primary uppercase">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          Design System v1.0
        </div>
        <h1 className="mb-6 font-serif text-[100px] leading-none font-extralight tracking-tight">
          Chen <span className="text-primary italic">Serif</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed font-light text-muted-foreground">
          一个精致的深色模式设计系统，将经典的 Newsreader 衬线字体与现代科技感完美融合。
          翡翠绿的强调色点缀，玻璃拟态的卡片设计，营造出优雅而专业的视觉体验。
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button variant="default" size="lg">
            <DownloadIcon className="h-4 w-4" />
            下载资源
          </Button>
          <Button variant="outline" size="lg">
            <BookOpenIcon className="h-4 w-4" />
            阅读文档
          </Button>
        </div>
      </div>
    </section>
  )
}

function ColorsSection() {
  return (
    <section id="colors" className="mb-12 border-b border-border pb-12">
      <SectionHeader
        title="色彩系统"
        description="经过精心调配的深色系配色方案，以翡翠绿为主强调色，营造专业而现代的视觉风格。"
      />

      <div className="mb-12">
        <h3 className="mb-4 font-mono text-xs tracking-widest text-muted-foreground uppercase">主色调 / Primary</h3>
        <div className="grid grid-cols-4 gap-4">
          {colorSwatches.map((color) => (
            <ColorSwatch key={color.name} {...color} />
          ))}
        </div>
      </div>

      <div className="mb-12">
        <h3 className="mb-4 font-mono text-xs tracking-widest text-muted-foreground uppercase">语义色 / Semantic</h3>
        <div className="grid grid-cols-4 gap-4">
          {semanticColors.map((color) => (
            <ColorSwatch key={color.name} {...color} />
          ))}
        </div>
      </div>

      <div className="mb-12">
        <h3 className="mb-4 font-mono text-xs tracking-widest text-muted-foreground uppercase">中性色 / Neutral</h3>
        <div className="grid grid-cols-4 gap-4">
          {neutralColors.map((color) => (
            <ColorSwatch key={color.name} {...color} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 font-mono text-xs tracking-widest text-muted-foreground uppercase">渐变色 / Gradient</h3>
        <div className="grid grid-cols-3 gap-4">
          {gradients.map((gradient, i) => (
            <div
              key={i}
              className="h-32 rounded-xl"
              style={{ background: gradient }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function TypographySection() {
  return (
    <section id="typography" className="mb-12 border-b border-border pb-12">
      <SectionHeader
        title="字体系统"
        description="三种精心搭配的字体：Newsreader 衬线用于标题，Space Grotesk 用于技术标签，Inter 用于正文。"
      />

      <div className="mb-12">
        <h3 className="mb-4 font-mono text-xs tracking-widest text-muted-foreground uppercase">字体家族 / Font Families</h3>
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <div className="mb-3 font-mono text-xs tracking-widest text-muted-foreground uppercase">Headlines</div>
            <div className="mb-2 font-serif text-3xl">Newsreader</div>
            <div className="text-sm text-muted-foreground">用于标题和强调文字</div>
          </Card>
          <Card>
            <div className="mb-3 font-mono text-xs tracking-widest text-muted-foreground uppercase">Technical</div>
            <div className="mb-2 font-mono text-3xl">Space Grotesk</div>
            <div className="text-sm text-muted-foreground">用于技术标签和代码</div>
          </Card>
          <Card>
            <div className="mb-3 font-mono text-xs tracking-widest text-muted-foreground uppercase">Body</div>
            <div className="mb-2 text-3xl">Inter</div>
            <div className="text-sm text-muted-foreground">用于正文内容</div>
          </Card>
        </div>
      </div>

      <div className="mb-12">
        <h3 className="mb-4 font-mono text-xs tracking-widest text-muted-foreground uppercase">字号比例 / Type Scale</h3>
        <Card>
          {typeScale.map((item, i) => (
            <div
              key={item.name}
              className={`
                flex items-center justify-between py-4
                ${i < typeScale.length - 1 ? "border-b border-white/5" : ""}
              `}
            >
              <span className="font-mono text-xs text-muted-foreground">{item.name}</span>
              <span className={item.style}>{item.sample}</span>
              <span className="font-mono text-xs text-muted-foreground">{item.size}</span>
            </div>
          ))}
        </Card>
      </div>

      <div>
        <h3 className="mb-4 font-mono text-xs tracking-widest text-muted-foreground uppercase">字重系列 / Font Weights</h3>
        <Card>
          {fontWeights.map((item, i) => (
            <div
              key={item.name}
              className={`
                flex items-center justify-between py-4
                ${i < fontWeights.length - 1 ? `border-b border-white/5` : ""}
              `}
            >
              <span className="text-sm text-muted-foreground">{item.name}</span>
              <span className={`
                text-xl
                ${item.weight}
              `}>The quick brown fox</span>
            </div>
          ))}
        </Card>
      </div>
    </section>
  )
}

function ComponentsSection() {
  const [tabValue, setTabValue] = React.useState("overview")
  const [inputValue, setInputValue] = React.useState("")
  const [searchValue, setSearchValue] = React.useState("")
  const [errorValue, setErrorValue] = React.useState("Invalid input")

  return (
    <section id="components" className="mb-12 border-b border-border pb-12">
      <SectionHeader
        title="组件库"
        description="精心设计的 UI 组件，每个都包含多种状态和变体，可直接用于生产环境。"
      />

      {/* Buttons */}
      <div className="mb-12">
        <h3 className="mb-4 font-mono text-xs tracking-widest text-muted-foreground uppercase">按钮 / Buttons</h3>

        <Card className="mb-4">
          <div className="mb-6 text-sm text-muted-foreground">变体 / Variants</div>
          <div className="flex flex-wrap gap-3">
            <Button variant="default">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </Card>

        <Card className="mb-4">
          <div className="mb-6 text-sm text-muted-foreground">尺寸 / Sizes</div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="default" size="sm">Small</Button>
            <Button variant="default">Medium</Button>
            <Button variant="default" size="lg">Large</Button>
            <Button variant="default" size="icon">
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        <Card>
          <div className="mb-6 text-sm text-muted-foreground">状态 / States</div>
          <div className="flex flex-wrap gap-3">
            <Button variant="default">Default</Button>
            <Button variant="default" disabled>Disabled</Button>
            <Button variant="default" className="animate-spin">
              <span>Loading</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* Inputs */}
      <div className="mb-12">
        <h3 className="mb-4 font-mono text-xs tracking-widest text-muted-foreground uppercase">输入框 / Inputs</h3>
        <Card>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="mb-2 block text-sm text-muted-foreground">Text Input</Label>
              <Input
                placeholder="Enter your name..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-2 block text-sm text-muted-foreground">Search Input</Label>
              <Input
                variant="search"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-2 block text-sm text-muted-foreground">Error State</Label>
              <Input
                variant="error"
                value={errorValue}
                onChange={(e) => setErrorValue(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-2 block text-sm text-muted-foreground">Disabled</Label>
              <Input placeholder="Disabled" disabled />
            </div>
          </div>
        </Card>
      </div>

      {/* Badges */}
      <div className="mb-12">
        <h3 className="mb-4 font-mono text-xs tracking-widest text-muted-foreground uppercase">徽章 / Badges</h3>
        <Card>
          <div className="flex flex-wrap gap-3">
            <Badge>Default</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="warning">Warning</Badge>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="mb-12">
        <h3 className="mb-4 font-mono text-xs tracking-widest text-muted-foreground uppercase">标签页 / Tabs</h3>
        <Card>
          <Tabs value={tabValue} onValueChange={setTabValue}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="components">Components</TabsTrigger>
              <TabsTrigger value="tokens">Tokens</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="pt-4">
              <p className="text-sm text-muted-foreground">Tab content area - select a tab to see the content change.</p>
            </TabsContent>
            <TabsContent value="components" className="pt-4">
              <p className="text-sm text-muted-foreground">Components tab content.</p>
            </TabsContent>
            <TabsContent value="tokens" className="pt-4">
              <p className="text-sm text-muted-foreground">Tokens tab content.</p>
            </TabsContent>
            <TabsContent value="resources" className="pt-4">
              <p className="text-sm text-muted-foreground">Resources tab content.</p>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Cards */}
      <div className="mb-12">
        <h3 className="mb-4 font-mono text-xs tracking-widest text-muted-foreground uppercase">卡片 / Cards</h3>
        <div className="grid grid-cols-3 gap-4">
          <Card variant="shimmer" className="min-h-[120px]">
            <div className="mb-2 font-mono text-xs tracking-widest text-primary uppercase">Shimmer Card</div>
            <p className="text-sm text-muted-foreground">悬停查看闪光边框效果</p>
          </Card>
          <Card variant="spotlight" className="min-h-[120px]">
            <div className="mb-2 font-mono text-xs tracking-widest text-primary uppercase">Spotlight Card</div>
            <p className="text-sm text-muted-foreground">移动鼠标查看光晕效果</p>
          </Card>
          <Card variant="glass" className="min-h-[120px]">
            <div className="mb-2 font-mono text-xs tracking-widest text-primary uppercase">Glass Card</div>
            <p className="text-sm text-muted-foreground">标准玻璃拟态卡片</p>
          </Card>
        </div>
      </div>

      {/* Lists */}
      <div>
        <h3 className="mb-4 font-mono text-xs tracking-widest text-muted-foreground uppercase">列表 / Lists</h3>
        <Card className="overflow-hidden p-0">
          <div className="divide-y divide-white/5">
            {[
              { icon: PaletteIcon, title: "色彩系统", desc: "精心调配的深色系配色" },
              { icon: TypeIcon, title: "字体系统", desc: "三种精心搭配的字体" },
              { icon: BoxIcon, title: "组件库", desc: "可直接用于生产环境" },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div
                  key={i}
                  className={`
                    flex cursor-pointer items-center gap-4 p-4 transition-colors
                    hover:bg-white/[0.02]
                  `}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.title}</div>
                    <div className="text-sm text-muted-foreground">{item.desc}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </section>
  )
}

function AvatarSection() {
  return (
    <section id="avatar" className="mb-12 border-b border-border pb-12">
      <SectionHeader
        title="头像"
        description="多种尺寸的头像组件，支持文字头像和图片头像，以及头像环效果。"
      />

      <div>
        <h3 className="mb-4 font-mono text-xs tracking-widest text-muted-foreground uppercase">尺寸 / Sizes</h3>
        <Card>
          <div className="flex items-center gap-10">
            <div className="flex flex-col items-center gap-3">
              <Avatar size="sm">
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
              <span className="font-mono text-xs text-muted-foreground">Small (32px)</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Avatar size="md">
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
              <span className="font-mono text-xs text-muted-foreground">Medium (40px)</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Avatar size="lg">
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
              <span className="font-mono text-xs text-muted-foreground">Large (64px)</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-lg bg-linear-to-br from-primary to-foreground p-0.5">
                <Avatar size="md">
                  <AvatarFallback>SC</AvatarFallback>
                </Avatar>
              </div>
              <span className="font-mono text-xs text-muted-foreground">With Ring</span>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}

function TableSection() {
  return (
    <section id="table" className="mb-12 border-b border-border pb-12">
      <SectionHeader
        title="数据表格"
        description="结构化的数据展示表格，包含排序、状态显示和操作按钮。"
      />

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>标题</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{row.title}</TableCell>
                <TableCell>
                  <Badge variant={row.badgeVariant}>{row.category}</Badge>
                </TableCell>
                <TableCell>
                  <span className={`
                    inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium
                    ${
                    row.status === "published"
                      ? "bg-primary/15 text-primary"
                      : "bg-warning/15 text-warning"
                  }
                  `}>
                    <span className={`
                      h-1.5 w-1.5 rounded-full
                      ${
                      row.status === "published" ? "bg-primary" : "bg-warning"
                    }
                    `} />
                    {row.status === "published" ? "已发布" : "草稿"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon-sm">
                      <Edit2Icon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm">
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </section>
  )
}

function PaginationSection() {
  return (
    <section id="pagination" className="mb-12 border-b border-border pb-12">
      <SectionHeader
        title="分页"
        description="用于长内容列表的分页导航组件，支持上一页/下一页和页码跳转。"
      />

      <div className="space-y-8">
        <div>
          <h3 className="mb-4 font-mono text-xs tracking-widest text-muted-foreground uppercase">基础分页</h3>
          <Card>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">4</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">5</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </Card>
        </div>

        <div>
          <h3 className="mb-4 font-mono text-xs tracking-widest text-muted-foreground uppercase">紧凑分页</h3>
          <Card>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationEllipsis />
                <PaginationItem>
                  <PaginationLink href="#">10</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </Card>
        </div>
      </div>
    </section>
  )
}

function ModalSection() {
  const [basicOpen, setBasicOpen] = React.useState(false)
  const [formOpen, setFormOpen] = React.useState(false)
  const [formName, setFormName] = React.useState("Sarah Chen")
  const [formEmail, setFormEmail] = React.useState("sarah@example.com")

  return (
    <section id="modal" className="mb-12 border-b border-border pb-12">
      <SectionHeader
        title="模态框"
        description="集中的对话框组件，用于重要信息的确认和表单输入。"
      />

      <Card>
        <div className="grid grid-cols-2 gap-8">
          <div className="text-center">
            <Button variant="default" onClick={() => setBasicOpen(true)}>
              <LayoutIcon className="h-4 w-4" />
              基础模态框
            </Button>
            <p className="mt-3 text-sm text-muted-foreground">标准确认对话框</p>
          </div>
          <div className="text-center">
            <Button variant="outline" onClick={() => setFormOpen(true)}>
              <FileTextIcon className="h-4 w-4" />
              表单模态框
            </Button>
            <p className="mt-3 text-sm text-muted-foreground">包含表单输入</p>
          </div>
        </div>
      </Card>

      {/* Basic Modal */}
      <Dialog open={basicOpen} onOpenChange={setBasicOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认操作</DialogTitle>
            <DialogDescription>确定要执行此操作吗？此操作无法撤销。</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setBasicOpen(false)}>取消</Button>
            <Button variant="default" onClick={() => setBasicOpen(false)}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Form Modal */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑资料</DialogTitle>
            <DialogDescription>更新您的个人资料信息。</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div>
              <Label className="mb-2 block text-sm text-muted-foreground">名称</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-2 block text-sm text-muted-foreground">邮箱</Label>
              <Input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>取消</Button>
            <Button variant="default" onClick={() => setFormOpen(false)}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}

function AnimationSection() {
  return (
    <section id="animation" className="mb-12 border-b border-border pb-12">
      <SectionHeader
        title="动画规范"
        description="统一的动画系统，使用 cubic-bezier(0.16, 1, 0.3, 1) 作为主缓动曲线，创造流畅自然的交互体验。"
      />

      {/* Easing */}
      <div className="mb-12">
        <h3 className="mb-4 font-mono text-xs tracking-widest text-muted-foreground uppercase">缓动曲线 / Easing</h3>
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-white/10 p-5">
              <div className="mb-2 text-sm font-medium">Smooth (Primary)</div>
              <code className="font-mono text-xs text-primary">cubic-bezier(0.16, 1, 0.3, 1)</code>
            </div>
            <div className="rounded-lg border border-white/10 p-5">
              <div className="mb-2 text-sm font-medium">Ease In Out</div>
              <code className="font-mono text-xs text-muted-foreground">cubic-bezier(0.4, 0, 0.2, 1)</code>
            </div>
          </div>
        </Card>
      </div>

      {/* Durations */}
      <div className="mb-12">
        <h3 className="mb-4 font-mono text-xs tracking-widest text-muted-foreground uppercase">动画时长 / Durations</h3>
        <div className="grid grid-cols-5 gap-4">
          {durations.map((item) => (
            <Card key={item.value} className="text-center">
              <div className="mb-2 font-mono text-2xl text-primary">{item.value}</div>
              <div className="mb-1 font-mono text-xs text-muted-foreground">{item.label}</div>
              <div className="text-xs text-muted-foreground">{item.desc}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Animation Demos */}
      <div className="mb-12">
        <h3 className="mb-4 font-mono text-xs tracking-widest text-muted-foreground uppercase">动画演示 / Animation Demos</h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Scale", action: "hover:scale-110" },
            { label: "Lift", action: "hover:-translate-y-1" },
            { label: "Fade", action: "hover:opacity-50" },
            { label: "Shimmer", action: "animate-pulse", isShimmer: true },
          ].map((item) => (
            <Card key={item.label} className="text-center">
              <div className="mb-4 flex justify-center py-8">
                {item.isShimmer ? (
                  <div
                    className="h-20 w-20 rounded-lg"
                    style={{
                      background: "linear-gradient(90deg, rgba(16,185,129,0.2), rgba(16,185,129,0.6), rgba(16,185,129,0.2))",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 2s infinite",
                    }}
                  />
                ) : (
                  <div
                    className={`
                      h-20 w-20 rounded-lg border border-white/10 bg-secondary transition-all duration-200
                      ${item.action}
                    `}
                    style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                  />
                )}
              </div>
              <div className="font-mono text-xs tracking-widest text-muted-foreground uppercase">{item.label}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Micro-interactions */}
      <div>
        <h3 className="mb-4 font-mono text-xs tracking-widest text-muted-foreground uppercase">微交互动画 / Micro-interactions</h3>
        <Card>
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className={`
                mx-auto mb-3 flex h-12 w-12 cursor-pointer items-center justify-center rounded-lg bg-secondary
                transition-all duration-200
                hover:bg-primary hover:text-black
              `} style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}>
                <PlusIcon className="h-5 w-5" />
              </div>
              <div className="mb-1 text-sm font-medium">Hover</div>
              <div className="text-xs text-muted-foreground">Scale + Color change</div>
            </div>
            <div className="text-center">
              <Button variant="default" className={`
                mb-3 w-full transition-transform duration-100
                active:scale-95
              `} style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}>
                Press Me
              </Button>
              <div className="mb-1 text-sm font-medium">Active</div>
              <div className="text-xs text-muted-foreground">Scale down to 0.95</div>
            </div>
            <div className="text-center">
              <Input className={`
                mb-3 text-center
                focus:ring-2 focus:ring-primary/30
              `} placeholder="Focus me" />
              <div className="mb-1 text-sm font-medium">Focus</div>
              <div className="text-xs text-muted-foreground">Ring glow effect</div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}

function EffectsSection() {
  const [visibleItems, setVisibleItems] = React.useState<number[]>([])

  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute("data-index") || "0")
          setVisibleItems((prev) => [...prev, index])
        }
      })
    }, { threshold: 0.1 })

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const listItems = [
    { icon: MousePointerIcon, title: "滚动显示动画", desc: "元素进入视口时淡入上移" },
    { icon: ZapIcon, title: "流畅自然", desc: "基于规范的缓动曲线" },
    { icon: SettingsIcon, title: "可自定义", desc: "支持延迟和动画时长调整" },
  ]

  return (
    <section id="effects" className="mb-12 border-b border-border pb-12">
      <SectionHeader
        title="特效组件"
        description="增强视觉体验的特殊效果，包括形态变化的Blob背景和渐变文字。"
      />

      {/* Morph Blob */}
      <div className="mb-12">
        <h3 className="mb-4 font-mono text-xs tracking-widest text-muted-foreground uppercase">形态变化背景 / Morph Blob</h3>
        <Card className="relative min-h-[300px] overflow-hidden">
          <div className="morph-blob morph-blob-1" />
          <div className="morph-blob morph-blob-2" />
          <div className="morph-blob morph-blob-3" />
          <div className="relative z-10 pt-12 text-center">
            <p className="text-sm text-muted-foreground">动画Blob背景效果，可用于Hero区域装饰</p>
          </div>
        </Card>
      </div>

      {/* Gradient Text */}
      <div className="mb-12">
        <h3 className="mb-4 font-mono text-xs tracking-widest text-muted-foreground uppercase">渐变文字 / Gradient Text</h3>
        <Card className="text-center" style={{ padding: "var(--spacing-3xl)" }}>
          <h2 className="gradient-text font-serif" style={{ fontSize: "48px", fontWeight: 600 }}>
            Chen Serif Design
          </h2>
          <p className="mt-6 text-sm text-muted-foreground">流动的渐变文字效果</p>
        </Card>
      </div>

      {/* Reveal Animation */}
      <div>
        <h3 className="mb-4 font-mono text-xs tracking-widest text-muted-foreground uppercase">滚动淡入 / Reveal Animation</h3>
        <Card className="overflow-hidden p-0">
          <div className="divide-y divide-white/5">
            {listItems.map((item, i) => {
              const Icon = item.icon
              return (
                <div
                  key={i}
                  data-index={i}
                  className={`
                    reveal flex items-center gap-4 p-4
                    ${visibleItems.includes(i) ? "visible" : ""}
                  `}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.title}</div>
                    <div className="text-sm text-muted-foreground">{item.desc}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="mt-12 pt-12">
      <div className="flex flex-col items-center gap-6">
        {/* Logo Mark */}
        <div className={`
          group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/10
          bg-secondary
        `}>
          <span className="relative z-10 font-serif text-xl font-bold text-primary">S</span>
          <div className={`
            absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 transition-opacity duration-300
            group-hover:opacity-100
          `} />
        </div>

        {/* Brand Name */}
        <div className="text-center">
          <h4 className="mb-1 font-serif text-2xl font-semibold tracking-tight">Chen Serif</h4>
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Design System</p>
        </div>

        {/* Divider */}
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Version & Copyright */}
        <div className="space-y-1 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Version 1.0.0
            </span>
            <span className="text-white/20">•</span>
            <span className="font-mono text-xs text-muted-foreground">2026</span>
          </div>
          <p className="text-sm text-muted-foreground">Built with precision and care</p>
        </div>

        {/* Decorative Corner Elements */}
        <div className="mt-6 flex items-center gap-3 opacity-30">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-white/30" />
          <div className="h-1 w-1 rounded-full bg-white/30" />
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-white/30" />
        </div>
      </div>
    </footer>
  )
}

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />

      <main className="ml-[260px] px-12 pt-0 pb-12" style={{ marginTop: "72px" }}>
        <HeroSection />
        <ColorsSection />
        <TypographySection />
        <ComponentsSection />
        <AvatarSection />
        <TableSection />
        <PaginationSection />
        <ModalSection />
        <AnimationSection />
        <EffectsSection />
        <Footer />
      </main>
    </div>
  )
}
