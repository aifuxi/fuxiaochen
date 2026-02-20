# 更新日志页面 Apple 设计重构

## 概述

将更新日志页面重构为 Apple 产品时间线风格，与 About 页面的设计语言保持一致。

## 设计决策

| 决策点 | 选择 | 理由 |
|--------|------|------|
| Hero 风格 | 极简时间轴 | 符合更新日志的时间线叙事特性 |
| 条目展示 | 完全展开 | 一次性看到全部详情，无需交互 |
| 最新标识 | 不需要 | 通过时间轴位置自然体现顺序 |
| 时间轴风格 | 细线 + 圆点 | Apple 经典设计，简洁现代 |

## 页面结构

```
┌─────────────────────────────────────────┐
│           Changelog                     │
│     记录产品的每一次迭代与改进           │
├─────────────────────────────────────────┤
│  ●─ v2.1.0 ─ 2026年2月15日              │
│  │  [Markdown 内容完全展开]              │
│  ●─ v2.0.0 ─ 2026年1月20日              │
│  │  [Markdown 内容完全展开]              │
│  ○─ v1.9.0 ─ 2025年12月10日             │
│  │  [Markdown 内容完全展开]              │
│  ... 更多条目（无限滚动）                │
└─────────────────────────────────────────┘
```

## 核心样式规范

### 布局

- 页面容器: `max-w-3xl mx-auto px-4`
- 标题区: 居中，`py-16 md:py-24`
- 内容区: `pl-10 md:pl-14 pb-12`（为时间轴留出空间）

### 标题区

| 元素 | 样式 |
|------|------|
| 标题 | `text-4xl md:text-5xl font-bold text-text` |
| 副标题 | `text-lg text-text-secondary mt-2` |

### 时间轴

| 元素 | 样式 |
|------|------|
| 时间轴线 | `absolute left-4 top-0 bottom-0 w-px bg-border md:left-6` |
| 圆点（当前年份） | `h-3 w-3 rounded-full bg-accent ring-4 ring-accent/20` |
| 圆点（往年） | `h-2.5 w-2.5 rounded-full bg-surface-hover border border-border` |

### 条目

| 元素 | 样式 |
|------|------|
| 版本号 | `text-lg font-semibold text-text` |
| 日期 | `text-sm text-text-tertiary` |
| 分隔符 | `mx-2 text-text-tertiary` |

## 交互

1. **无限滚动加载**: 使用 IntersectionObserver 检测底部，触发下一页加载
2. **加载状态**: 时间轴底部显示 Loader2 旋转动画
3. **空状态**: 居中显示 "暂无更新日志"
4. **错误状态**: 居中显示 "加载失败，请稍后重试"

## 技术实现

- 保持现有的 `useSWRInfinite` 数据获取逻辑
- 保持现有的 `IntersectionObserver` 无限滚动
- 重构 `ChangelogCard` 组件为时间轴样式
- 新增时间轴容器组件处理布局和线条渲染

## 文件变更

- `app/(site)/changelog/page.tsx` - 主要重构文件
