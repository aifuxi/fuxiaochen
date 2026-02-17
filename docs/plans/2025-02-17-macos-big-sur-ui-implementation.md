# macOS Big Sur UI 组件库实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在当前 Next.js 项目中集成 macOS Big Sur 设计风格的内部组件库

**Architecture:** 基于 @radix-ui primitives 构建，使用 Tailwind CSS v4 样式系统，采用 class-variance-authority (CVA) 管理组件变体，支持深色/浅色主题切换。组件采用复制粘贴模式（非 npm 包），直接集成到项目 components/ui 目录。

**Tech Stack:** Next.js 16, Tailwind CSS v4, @radix-ui/*, TypeScript, CVA, next-themes

---

## 前置条件

### Task 1: 安装缺失依赖

**Files:**
- Modify: `package.json`

**Step 1: 检查已安装依赖**

Run: `pnpm list @radix-ui/react-slot @radix-ui/react-select vaul`
Expected: 确认已安装的依赖

**Step 2: 安装缺失依赖**

Run:
```bash
pnpm add @radix-ui/react-select vaul
```
Expected: 依赖安装成功

**Step 3: 提交**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: install ui dependencies"
```

---

## 基础设施

### Task 2: 创建全局样式和 CSS 变量

**Files:**
- Create: `styles/global.css`

**Step 1: 创建样式目录**

Run: `mkdir -p styles`
Expected: 目录创建成功

**Step 2: 创建全局样式文件**

```css
@import "tailwindcss";

@theme {
  /* 颜色 - 浅色模式 */
  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.1 0 0);
  --color-surface: oklch(1 0 0);
  --color-surface-foreground: oklch(0.1 0 0);
  --color-border: oklch(0.9 0 0);
  --color-primary: oklch(0.6 0.25 250);
  --color-primary-foreground: oklch(0.99 0 0);
  --color-secondary: oklch(0.6 0 0);
  --color-secondary-foreground: oklch(0.99 0 0);
  --color-accent: oklch(0.96 0 0);
  --color-accent-foreground: oklch(0.1 0 0);
  --color-muted: oklch(0.96 0 0);
  --color-muted-foreground: oklch(0.55 0 0);
  --color-destructive: oklch(0.6 0.25 25);
  --color-destructive-foreground: oklch(0.99 0 0);

  /* 圆角 */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-full: 9999px;

  /* 阴影 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

  /* 毛玻璃 */
  --backdrop-blur: 20px;
  --backdrop-saturate: 180%;
}

/* 深色模式 */
.dark {
  --color-background: oklch(0.12 0 0);
  --color-foreground: oklch(0.95 0 0);
  --color-surface: oklch(0.15 0 0);
  --color-surface-foreground: oklch(0.95 0 0);
  --color-border: oklch(0.2 0 0);
  --color-primary: oklch(0.65 0.25 250);
  --color-primary-foreground: oklch(0.99 0 0);
  --color-secondary: oklch(0.6 0 0);
  --color-secondary-foreground: oklch(0.99 0 0);
  --color-accent: oklch(0.2 0 0);
  --color-accent-foreground: oklch(0.95 0 0);
  --color-muted: oklch(0.2 0 0);
  --color-muted-foreground: oklch(0.6 0 0);
  --color-destructive: oklch(0.6 0.25 25);
  --color-destructive-foreground: oklch(0.99 0 0);
}

/* 基础样式 */
* {
  @apply border-border;
}

body {
  @apply bg-background text-foreground;
  font-feature-settings: "rlig" 1, "calt" 1;
}

/* 毛玻璃效果类 */
.glass {
  backdrop-filter: blur(var(--backdrop-blur)) saturate(var(--backdrop-saturate));
  -webkit-backdrop-filter: blur(var(--backdrop-blur)) saturate(var(--backdrop-saturate));
}

/* 过渡动画 */
* {
  @apply transition-colors duration-200;
}

input, textarea, select {
  @apply outline-none;
}
```

**Step 3: 提交**

```bash
git add styles/global.css
git commit -m "feat: add global styles and CSS variables"
```

---

### Task 3: 创建组件目录结构

**Files:**
- Create: `components/ui/`
- Create: `components/base/`

**Step 1: 创建目录结构**

Run:
```bash
mkdir -p components/ui/{button,input,textarea,select,dialog,drawer,popover,card,badge,tag}
mkdir -p components/base
```
Expected: 目录结构创建成功

**Step 2: 创建统一导出文件**

```typescript
// components/ui/index.ts
export { Button } from "./button";
export { Input } from "./input";
export { Textarea } from "./textarea";
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
export { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "./drawer";
export { Popover, PopoverContent, PopoverTrigger } from "./popover";
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
export { Badge } from "./badge";
export { Tag } from "./tag";
```

**Step 3: 提交**

```bash
git add components/ui/index.ts
git commit -m "chore: create component directory structure"
```

---

### Task 4: 创建基础工具函数和 Slot 组件

**Files:**
- Create: `lib/utils.ts` (如果不存在)
- Create: `components/base/slot.tsx`

**Step 1: 创建工具函数**

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Step 2: 创建 Slot 组件**

```typescript
// components/base/slot.tsx
import * as React from "react";
import * as SlotPrimitive from "@radix-ui/react-slot";

const Slot = React.forwardRef<
  React.ElementRef<typeof SlotPrimitive.Slot>,
  React.ComponentPropsWithoutRef<typeof SlotPrimitive.Slot>
>(({ ...props }, ref) => <SlotPrimitive.Slot ref={ref} {...props} />);
Slot.displayName = SlotPrimitive.Root.displayName;

export { Slot };
```

**Step 3: 提交**

```bash
git add lib/utils.ts components/base/slot.tsx
git commit -m "chore: add utils and base Slot component"
```

---

## 组件实现

### Task 5: 实现 Button 组件

**Files:**
- Create: `components/ui/button/button.tsx`
- Create: `components/ui/button/index.ts`

**Step 1: 创建 Button 组件**

```typescript
// components/ui/button/button.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md",
        primary:
          "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md hover:shadow-lg hover:scale-[1.02]",
        secondary:
          "bg-surface text-surface-foreground border border-border hover:bg-accent hover:text-accent-foreground",
        ghost:
          "text-foreground hover:bg-accent hover:text-accent-foreground glass",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-lg",
        md: "h-10 px-4 py-2 rounded-lg",
        lg: "h-12 px-6 text-base rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

**Step 2: 创建导出文件**

```typescript
// components/ui/button/index.ts
export { Button, buttonVariants } from "./button";
```

**Step 3: 提交**

```bash
git add components/ui/button/
git commit -m "feat: add Button component with Big Sur style"
```

---

### Task 6: 实现 Input 组件

**Files:**
- Create: `components/ui/input/input.tsx`
- Create: `components/ui/input/index.ts`

**Step 1: 创建 Input 组件**

```typescript
// components/ui/input/input.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-surface-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 glass",
  {
    variants: {
      variant: {
        default: "",
        filled: "bg-accent/50 border-transparent",
      },
      size: {
        sm: "h-8 px-2 text-xs rounded-md",
        md: "h-10 px-3 text-sm rounded-lg",
        lg: "h-12 px-4 text-base rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
```

**Step 2: 创建导出文件**

```typescript
// components/ui/input/index.ts
export { Input } from "./input";
```

**Step 3: 提交**

```bash
git add components/ui/input/
git commit -m "feat: add Input component with Big Sur style"
```

---

### Task 7: 实现 Textarea 组件

**Files:**
- Create: `components/ui/textarea/textarea.tsx`
- Create: `components/ui/textarea/index.ts`

**Step 1: 创建 Textarea 组件**

```typescript
// components/ui/textarea/textarea.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textareaVariants = cva(
  "flex min-h-[80px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-surface-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 glass resize-none",
  {
    variants: {
      size: {
        sm: "min-h-[60px] px-2 py-1.5 text-xs rounded-md",
        md: "min-h-[80px] px-3 py-2 text-sm rounded-lg",
        lg: "min-h-[120px] px-4 py-3 text-base rounded-xl",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
```

**Step 2: 创建导出文件**

```typescript
// components/ui/textarea/index.ts
export { Textarea } from "./textarea";
```

**Step 3: 提交**

```bash
git add components/ui/textarea/
git commit -m "feat: add Textarea component with Big Sur style"
```

---

### Task 8: 实现 Select 组件

**Files:**
- Create: `components/ui/select/select.tsx`
- Create: `components/ui/select/index.ts`

**Step 1: 创建 Select 组件**

```typescript
// components/ui/select/select.tsx
import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-sm text-surface-foreground ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 glass",
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-lg border border-border bg-surface text-surface-foreground shadow-xl shadow-black/10 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 glass",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className,
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold text-foreground", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors duration-150",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2.5 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-border", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
```

**Step 2: 创建导出文件**

```typescript
// components/ui/select/index.ts
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from "./select";
```

**Step 3: 提交**

```bash
git add components/ui/select/
git commit -m "feat: add Select component with Big Sur style"
```

---

### Task 9: 实现 Dialog 组件

**Files:**
- Create: `components/ui/dialog/dialog.tsx`
- Create: `components/ui/dialog/index.ts`

**Step 1: 创建 Dialog 组件**

```typescript
// components/ui/dialog/dialog.tsx
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-background/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 transition-all duration-200",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 rounded-xl border border-border bg-surface/95 p-6 shadow-2xl shadow-black/20 glass duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-md opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">关闭</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-foreground",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
```

**Step 2: 创建导出文件**

```typescript
// components/ui/dialog/index.ts
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./dialog";
```

**Step 3: 提交**

```bash
git add components/ui/dialog/
git commit -m "feat: add Dialog component with Big Sur style"
```

---

### Task 10: 实现 Drawer 组件

**Files:**
- Create: `components/ui/drawer/drawer.tsx`
- Create: `components/ui/drawer/index.ts`

**Step 1: 创建 Drawer 组件**

```typescript
// components/ui/drawer/drawer.tsx
import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Drawer = ({ shouldScaleBackground = true, ...props }: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />
);
Drawer.displayName = "Drawer";

const DrawerTrigger = DrawerPrimitive.Trigger;
const DrawerPortal = DrawerPrimitive.Portal;
const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-background/60 backdrop-blur-sm", className)}
    {...props}
  />
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[20px] border border-border bg-surface/95 p-6 glass duration-200",
        className,
      )}
      {...props}
    >
      <div className="mx-auto mt-4 h-1.5 w-10 rounded-full bg-border/50" />
      {children}
      <DrawerPrimitive.Close className="absolute right-4 top-4 rounded-md opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:pointer-events-none">
        <X className="h-4 w-4" />
        <span className="sr-only">关闭</span>
      </DrawerPrimitive.Close>
    </DrawerPrimitive.Content>
  </DrawerPortal>
));
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)} {...props} />
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />
);
DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight text-foreground", className)}
    {...props}
  />
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
};
```

**Step 2: 创建导出文件**

```typescript
// components/ui/drawer/index.ts
export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
} from "./drawer";
```

**Step 3: 提交**

```bash
git add components/ui/drawer/
git commit -m "feat: add Drawer component with Big Sur style"
```

---

### Task 11: 实现 Popover 组件

**Files:**
- Create: `components/ui/popover/popover.tsx`
- Create: `components/ui/popover/index.ts`

**Step 1: 创建 Popover 组件**

```typescript
// components/ui/popover/popover.tsx
import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-xl border border-border bg-surface/95 p-4 shadow-xl shadow-black/10 text-sm text-surface-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 glass",
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent };
```

**Step 2: 创建导出文件**

```typescript
// components/ui/popover/index.ts
export { Popover, PopoverTrigger, PopoverContent } from "./popover";
```

**Step 3: 提交**

```bash
git add components/ui/popover/
git commit -m "feat: add Popover component with Big Sur style"
```

---

### Task 12: 实现 Card 组件

**Files:**
- Create: `components/ui/card/card.tsx`
- Create: `components/ui/card/index.ts`

**Step 1: 创建 Card 组件**

```typescript
// components/ui/card/card.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-border bg-surface/80 shadow-lg shadow-black/5 glass transition-all duration-200 hover:shadow-xl",
      className,
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight text-foreground", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
```

**Step 2: 创建导出文件**

```typescript
// components/ui/card/index.ts
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "./card";
```

**Step 3: 提交**

```bash
git add components/ui/card/
git commit -m "feat: add Card component with Big Sur style"
```

---

### Task 13: 实现 Badge 组件

**Files:**
- Create: `components/ui/badge/badge.tsx`
- Create: `components/ui/badge/index.ts`

**Step 1: 创建 Badge 组件**

```typescript
// components/ui/badge/badge.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "text-foreground border border-border",
        success:
          "border-transparent bg-emerald-500 text-white shadow-sm hover:bg-emerald-600",
        warning:
          "border-transparent bg-amber-500 text-white shadow-sm hover:bg-amber-600",
      },
      size: {
        sm: "px-2 py-0 text-[10px]",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
```

**Step 2: 创建导出文件**

```typescript
// components/ui/badge/index.ts
export { Badge, badgeVariants } from "./badge";
```

**Step 3: 提交**

```bash
git add components/ui/badge/
git commit -m "feat: add Badge component with Big Sur style"
```

---

### Task 14: 实现 Tag 组件

**Files:**
- Create: `components/ui/tag/tag.tsx`
- Create: `components/ui/tag/index.ts`

**Step 1: 创建 Tag 组件**

```typescript
// components/ui/tag/tag.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const tagVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/20",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-accent-foreground hover:bg-accent/80",
        primary:
          "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15",
        secondary:
          "bg-secondary/10 text-secondary-foreground border border-secondary/20 hover:bg-secondary/15",
        outline:
          "border border-border text-foreground hover:bg-accent",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-3 py-1 text-sm",
        lg: "px-4 py-1.5 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface TagProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tagVariants> {
  removable?: boolean;
  onRemove?: () => void;
}

const Tag = React.forwardRef<HTMLDivElement, TagProps>(
  ({ className, variant, size, removable, onRemove, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(tagVariants({ variant, size }), className)} {...props}>
        {children}
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-full p-0.5 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">删除标签</span>
          </button>
        )}
      </div>
    );
  },
);
Tag.displayName = "Tag";

export { Tag, tagVariants };
```

**Step 2: 创建导出文件**

```typescript
// components/ui/tag/index.ts
export { Tag, tagVariants } from "./tag";
```

**Step 3: 提交**

```bash
git add components/ui/tag/
git commit -m "feat: add Tag component with Big Sur style"
```

---

## 示例页面

### Task 15: 创建组件示例页面

**Files:**
- Create: `app/examples/page.tsx`

**Step 1: 创建示例页面**

```typescript
// app/examples/page.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/components/ui/tag";

export default function ExamplesPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* 标题 */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            macOS Big Sur 风格组件库
          </h1>
          <p className="text-muted-foreground text-lg">
            融合 macOS Big Sur 设计元素与现代 Web 设计趋势
          </p>
        </div>

        {/* 按钮示例 */}
        <Card>
          <CardHeader>
            <CardTitle>按钮 (Button)</CardTitle>
            <CardDescription>不同变体和大小的按钮组件</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <Button variant="default">默认</Button>
              <Button variant="primary">主要</Button>
              <Button variant="secondary">次要</Button>
              <Button variant="ghost">幽灵</Button>
              <Button variant="link">链接</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">小号</Button>
              <Button size="md">中号</Button>
              <Button size="lg">大号</Button>
            </div>
          </CardContent>
        </Card>

        {/* 输入框示例 */}
        <Card>
          <CardHeader>
            <CardTitle>输入框 (Input)</CardTitle>
            <CardDescription>不同变体和大小的输入框</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Input placeholder="默认输入框" />
              <Input variant="filled" placeholder="填充风格输入框" />
              <Input size="sm" placeholder="小号输入框" />
              <Input size="lg" placeholder="大号输入框" />
            </div>
          </CardContent>
        </Card>

        {/* 文本域示例 */}
        <Card>
          <CardHeader>
            <CardTitle>文本域 (Textarea)</CardTitle>
            <CardDescription>不同大小的文本域</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea placeholder="默认文本域" />
            <Textarea size="lg" placeholder="大号文本域" />
          </CardContent>
        </Card>

        {/* 选择器示例 */}
        <Card>
          <CardHeader>
            <CardTitle>选择器 (Select)</CardTitle>
            <CardDescription>下拉选择器组件</CardDescription>
          </CardHeader>
          <CardContent>
            <Select>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="选择一个选项" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">选项 1</SelectItem>
                <SelectItem value="option2">选项 2</SelectItem>
                <SelectItem value="option3">选项 3</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* 对话框示例 */}
        <Card>
          <CardHeader>
            <CardTitle>对话框 (Dialog)</CardTitle>
            <CardDescription>模态对话框组件</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button>打开对话框</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>对话框标题</DialogTitle>
                  <DialogDescription>
                    这是一个模态对话框，采用 Big Sur 风格设计
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="输入内容..." />
                  <Button className="w-full">确认</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* 抽屉示例 */}
        <Card>
          <CardHeader>
            <CardTitle>抽屉 (Drawer)</CardTitle>
            <CardDescription>侧边抽屉组件</CardDescription>
          </CardHeader>
          <CardContent>
            <Drawer>
              <DrawerTrigger asChild>
                <Button>打开抽屉</Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>抽屉标题</DrawerTitle>
                </DrawerHeader>
                <div className="p-4 space-y-4">
                  <p className="text-muted-foreground">
                    这是一个从底部滑出的抽屉组件
                  </p>
                  <Input placeholder="输入内容..." />
                  <Button className="w-full">确认</Button>
                </div>
              </DrawerContent>
            </Drawer>
          </CardContent>
        </Card>

        {/* 弹窗示例 */}
        <Card>
          <CardHeader>
            <CardTitle>弹窗 (Popover)</CardTitle>
            <CardDescription>悬浮弹窗组件</CardDescription>
          </CardHeader>
          <CardContent>
            <Popover>
              <PopoverTrigger asChild>
                <Button>打开弹窗</Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="space-y-2">
                  <p className="font-medium">弹窗内容</p>
                  <p className="text-sm text-muted-foreground">
                    这是一个悬浮弹窗，点击外部可以关闭
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>

        {/* 徽章示例 */}
        <Card>
          <CardHeader>
            <CardTitle>徽章 (Badge)</CardTitle>
            <CardDescription>不同变体和大小的徽章</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <Badge variant="default">默认</Badge>
              <Badge variant="secondary">次要</Badge>
              <Badge variant="destructive">危险</Badge>
              <Badge variant="outline">轮廓</Badge>
              <Badge variant="success">成功</Badge>
              <Badge variant="warning">警告</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge size="sm">小号</Badge>
              <Badge size="md">中号</Badge>
              <Badge size="lg">大号</Badge>
            </div>
          </CardContent>
        </Card>

        {/* 标签示例 */}
        <Card>
          <CardHeader>
            <CardTitle>标签 (Tag)</CardTitle>
            <CardDescription>不同变体和大小的标签</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <Tag>默认</Tag>
              <Tag variant="primary">主要</Tag>
              <Tag variant="secondary">次要</Tag>
              <Tag variant="outline">轮廓</Tag>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Tag>可删除</Tag>
              <Tag removable>删除我</Tag>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

**Step 2: 提交**

```bash
git add app/examples/page.tsx
git commit -m "feat: add component examples page"
```

---

## 完成

### Task 16: 最终验证和提交

**Step 1: 验证项目构建**

Run:
```bash
pnpm build
```
Expected: 构建成功

**Step 2: 启动开发服务器验证**

Run:
```bash
pnpm dev
```
Expected: 开发服务器启动成功，访问 /examples 页面查看所有组件

**Step 3: 最终提交**

```bash
git add .
git commit -m "feat: complete macOS Big Sur UI component library"
```

---

## 设计决策记录

1. **采用 OKLCH 颜色空间**：相比 HSL/RGB，OKLCH 提供更好的颜色一致性和可感知均匀性
2. **毛玻璃效果统一使用 glass 类**：便于复用和维护
3. **组件变体使用 CVA 管理**：提供类型安全的变体系统
4. **所有组件支持 ref 转发**：满足更多使用场景
5. **统一导出文件**：通过 components/ui/index.ts 统一导出所有组件

## 相关文档

- 设计文档：`docs/plans/2025-02-17-macos-big-sur-ui-design.md`
- Radix UI 文档：https://www.radix-ui.com/primitives/docs
- Tailwind CSS v4 文档：https://tailwindcss.com/docs
