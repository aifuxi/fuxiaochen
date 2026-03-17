# UI Components

All components are in `/components/ui/`. They use shadcn/ui new-york style with Radix UI primitives, Tailwind CSS 4, and class-variance-authority. The design system uses Zinc color preset with oklch color values.

---

## button.tsx

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  `
    inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap
    transition-all outline-none
    focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50
    disabled:pointer-events-none disabled:opacity-50
    aria-invalid:border-destructive aria-invalid:ring-destructive/20
    dark:aria-invalid:ring-destructive/40
    [&_svg]:pointer-events-none [&_svg]:shrink-0
    [&_svg:not([class*='size-'])]:size-4
  `,
  {
    variants: {
      variant: {
        default: `bg-primary text-primary-foreground hover:bg-primary/90`,
        destructive: `bg-destructive text-primary-foreground hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40`,
        outline: `border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50`,
        secondary: `bg-secondary text-secondary-foreground hover:bg-secondary/80`,
        ghost: `hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50`,
        link: `text-primary underline-offset-4 hover:underline`,
      },
      size: {
        default: `h-9 px-4 py-2 has-[>svg]:px-3`,
        xs: `h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3`,
        sm: `h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5`,
        lg: `h-10 rounded-md px-6 has-[>svg]:px-4`,
        icon: "size-9",
        "icon-xs": `size-6 rounded-md [&_svg:not([class*='size-'])]:size-3`,
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
```

**Variants:** `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
**Sizes:** `default` (h-9), `xs` (h-6), `sm` (h-8), `lg` (h-10), `icon` (size-9), `icon-xs`, `icon-sm`, `icon-lg`

---

## badge.tsx

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  `inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent
   px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow]
   focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50
   [&>svg]:pointer-events-none [&>svg]:size-3`,
  {
    variants: {
      variant: {
        default: `bg-primary text-primary-foreground [a&]:hover:bg-primary/90`,
        secondary: `bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90`,
        destructive: `bg-destructive text-primary-foreground focus-visible:ring-destructive/20 dark:bg-destructive/60 [a&]:hover:bg-destructive/90`,
        outline: `border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground`,
        ghost: `[a&]:hover:bg-accent [a&]:hover:text-accent-foreground`,
        link: `text-primary underline-offset-4 [a&]:hover:underline`,
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"
  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
```

**Variants:** `default`, `secondary`, `destructive`, `outline`, `ghost`, `link`

---

## card.tsx

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn("flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm", className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(`@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6
        has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6`, className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-title" className={cn("leading-none font-semibold", className)} {...props} />
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-description" className={cn("text-sm text-muted-foreground", className)} {...props} />
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("px-6", className)} {...props} />
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-footer" className={cn("flex items-center px-6 [.border-t]:pt-6", className)} {...props} />
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent }
```

---

## glass-card.tsx

```tsx
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "hover";
}

export function GlassCard({ children, className, variant = "default", ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-muted p-6 shadow-sm",
        variant === "hover" && "transition-all duration-200 ease-in-out hover:shadow-md",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

---

## input.tsx

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        `h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs
         transition-[color,box-shadow] outline-none
         selection:bg-primary selection:text-primary-foreground
         file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground
         placeholder:text-muted-foreground
         disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50
         md:text-sm dark:bg-input/30`,
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
```

---

## textarea.tsx

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        `flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base
         shadow-xs transition-[color,box-shadow] outline-none
         placeholder:text-muted-foreground
         focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50
         disabled:cursor-not-allowed disabled:opacity-50
         aria-invalid:border-destructive aria-invalid:ring-destructive/20
         md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40`,
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
```

---

## label.tsx

```tsx
"use client"
import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        `flex items-center gap-2 text-sm leading-none font-medium select-none
         group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50
         peer-disabled:cursor-not-allowed peer-disabled:opacity-50`,
        className
      )}
      {...props}
    />
  )
}

export { Label }
```

---

## select.tsx

```tsx
"use client"
import * as React from "react"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { Select as SelectPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

// Root, Group, Value — thin wrappers
function Select({ ...props }) { return <SelectPrimitive.Root data-slot="select" {...props} /> }
function SelectGroup({ ...props }) { return <SelectPrimitive.Group data-slot="select-group" {...props} /> }
function SelectValue({ ...props }) { return <SelectPrimitive.Value data-slot="select-value" {...props} /> }

function SelectTrigger({ className, size = "default", children, ...props }) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        `flex w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm
         whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none
         focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50
         disabled:cursor-not-allowed disabled:opacity-50
         data-[placeholder]:text-muted-foreground
         data-[size=default]:h-9 data-[size=sm]:h-8
         dark:bg-input/30 dark:hover:bg-input/50`,
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({ className, children, position = "item-aligned", align = "center", ...props }) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          `relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem]
           overflow-x-hidden overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md
           data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
           data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95`,
          className
        )}
        position={position}
        align={align}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectItem({ className, children, ...props }) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        `relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none
         focus:bg-accent focus:text-accent-foreground
         data-[disabled]:pointer-events-none data-[disabled]:opacity-50`,
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectItem }
```

---

## checkbox.tsx

```tsx
"use client"
import * as React from "react"
import { CheckIcon } from "lucide-react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        `peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs transition-shadow outline-none
         focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50
         disabled:cursor-not-allowed disabled:opacity-50
         data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground
         dark:bg-input/30 dark:data-[state=checked]:bg-primary`,
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="grid place-content-center text-current transition-none">
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
```

---

## switch.tsx

```tsx
"use client"
import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

function Switch({ className, size = "default", ...props }) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        `peer group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none
         focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50
         disabled:cursor-not-allowed disabled:opacity-50
         data-[size=default]:h-[1.15rem] data-[size=default]:w-8
         data-[size=sm]:h-3.5 data-[size=sm]:w-6
         data-[state=checked]:bg-primary data-[state=unchecked]:bg-input
         dark:data-[state=unchecked]:bg-input/80`,
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className={cn(
        `pointer-events-none block rounded-full bg-background ring-0 transition-transform
         group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3
         data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0
         dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground`
      )} />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
```

---

## radio-group.tsx

```tsx
"use client"
import * as React from "react"
import { CircleIcon } from "lucide-react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

function RadioGroup({ className, ...props }) {
  return <RadioGroupPrimitive.Root data-slot="radio-group" className={cn("grid gap-3", className)} {...props} />
}

function RadioGroupItem({ className, ...props }) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        `aspect-square size-4 shrink-0 rounded-full border border-input text-primary shadow-xs transition-[color,box-shadow] outline-none
         focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50
         disabled:cursor-not-allowed disabled:opacity-50
         dark:bg-input/30`,
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="relative flex items-center justify-center">
        <CircleIcon className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 fill-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
```

---

## dialog.tsx

```tsx
"use client"
import * as React from "react"
import { XIcon } from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

function Dialog({ ...props }) { return <DialogPrimitive.Root data-slot="dialog" {...props} /> }
function DialogTrigger({ ...props }) { return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} /> }
function DialogPortal({ ...props }) { return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} /> }
function DialogClose({ ...props }) { return <DialogPrimitive.Close data-slot="dialog-close" {...props} /> }

function DialogOverlay({ className, ...props }) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        `fixed inset-0 z-50 bg-black/50
         data-[state=closed]:animate-out data-[state=closed]:fade-out-0
         data-[state=open]:animate-in data-[state=open]:fade-in-0`,
        className
      )}
      {...props}
    />
  )
}

function DialogContent({ className, children, showCloseButton = true, ...props }) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          `fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%]
           gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 outline-none
           data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
           data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95
           sm:max-w-lg`,
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close className="absolute top-4 right-4 rounded-xs opacity-70 hover:opacity-100 focus:outline-hidden disabled:pointer-events-none [&_svg:not([class*='size-'])]:size-4">
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }) {
  return <div data-slot="dialog-header" className={cn("flex flex-col gap-2 text-center sm:text-left", className)} {...props} />
}

function DialogFooter({ className, showCloseButton = false, children, ...props }) {
  return (
    <div data-slot="dialog-footer" className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props}>
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">Close</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({ className, ...props }) {
  return <DialogPrimitive.Title data-slot="dialog-title" className={cn("text-lg leading-none font-semibold", className)} {...props} />
}

function DialogDescription({ className, ...props }) {
  return <DialogPrimitive.Description data-slot="dialog-description" className={cn("text-sm text-muted-foreground", className)} {...props} />
}

export { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger }
```

---

## alert-dialog.tsx

Key exports: `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent` (sizes: `default`, `sm`), `AlertDialogHeader`, `AlertDialogFooter`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogMedia`, `AlertDialogAction`, `AlertDialogCancel`

- `AlertDialogContent` accepts `size?: "default" | "sm"` prop
- `AlertDialogAction` and `AlertDialogCancel` accept `variant` and `size` from Button

---

## sheet.tsx

```tsx
"use client"
// Uses Dialog primitive from radix-ui for Sheet
// SheetContent accepts side?: "top" | "right" | "bottom" | "left" (default: "right")
// SheetContent accepts showCloseButton?: boolean (default: true)
// Exports: Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription
```

---

## drawer.tsx

```tsx
"use client"
// Uses vaul Drawer primitive
// DrawerContent supports all 4 directions via data-vaul-drawer-direction
// Shows drag handle for bottom drawers
// Exports: Drawer, DrawerPortal, DrawerOverlay, DrawerTrigger, DrawerClose, DrawerContent,
//          DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription
```

---

## tooltip.tsx

```tsx
"use client"
// TooltipProvider (delayDuration=0 default), Tooltip, TooltipTrigger
// TooltipContent: z-50, bg-foreground text-background, rounded-md, px-3 py-1.5 text-xs
// Includes TooltipPrimitive.Arrow with bg-foreground fill
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
```

---

## popover.tsx

```tsx
"use client"
// PopoverContent: z-50 w-72, bg-popover, rounded-md border, shadow-md
// PopoverHeader, PopoverTitle, PopoverDescription sub-components
export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor, PopoverHeader, PopoverTitle, PopoverDescription }
```

---

## dropdown-menu.tsx

Key exports: `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuGroup`, `DropdownMenuItem` (variant: `default` | `destructive`), `DropdownMenuCheckboxItem`, `DropdownMenuRadioGroup`, `DropdownMenuRadioItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuShortcut`, `DropdownMenuSub`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent`

---

## table.tsx

```tsx
"use client"
// Table (with overflow-x-auto container), TableHeader, TableBody, TableFooter
// TableRow: hover:bg-muted/50, data-[state=selected]:bg-muted
// TableHead: h-10 px-2 text-foreground font-medium
// TableCell: p-2 align-middle whitespace-nowrap
// TableCaption: mt-4 text-sm text-muted-foreground
export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption }
```

---

## data-table.tsx

```tsx
"use client"
// Full-featured data table using @tanstack/react-table
// Props: columns, data, showPagination (default true), pageSize (default 10),
//        pageSizeOptions (default [10,20,30,50]), emptyText, containerClassName
// Features: sorting, filtering, pagination, column visibility, column pinning (actions pinned right)
export function DataTable<TData, TValue>({ columns, data, ... })
```

---

## avatar.tsx

```tsx
"use client"
// Avatar: sizes sm (size-6), default (size-8), lg (size-10) via data-size
// AvatarImage: aspect-square size-full
// AvatarFallback: bg-muted text-muted-foreground rounded-full
// AvatarBadge: absolute bottom-right, bg-primary, ring-2 ring-background
// AvatarGroup: flex -space-x-2 with ring-2 ring-background on children
// AvatarGroupCount: like Avatar but shows count
export { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount }
```

---

## skeleton.tsx

```tsx
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="skeleton" className={cn("animate-pulse rounded-md bg-accent", className)} {...props} />
}
export { Skeleton }
```

---

## separator.tsx

```tsx
"use client"
// Horizontal: h-px w-full bg-border
// Vertical: h-full w-px bg-border
// orientation: "horizontal" (default) | "vertical"
export { Separator }
```

---

## scroll-area.tsx

```tsx
"use client"
// Wraps radix ScrollArea with styled scrollbar (w-2.5, bg-border thumb)
export { ScrollArea, ScrollBar }
```

---

## pagination.tsx

```tsx
// Pagination (nav, role=navigation), PaginationContent (flex gap-1)
// PaginationLink: uses buttonVariants, isActive shows outline variant
// PaginationPrevious: ChevronLeft + "Previous" (hidden on mobile)
// PaginationNext: "Next" + ChevronRight (hidden on mobile)
// PaginationEllipsis: MoreHorizontalIcon size-4
export { Pagination, PaginationContent, PaginationLink, PaginationItem, PaginationPrevious, PaginationNext, PaginationEllipsis }
```

---

## back-to-top.tsx

```tsx
"use client"
// Fixed bottom-right button, visible after 300px scroll
// rounded-full border border-border bg-muted h-12 w-12
// hover:-translate-y-1 hover:shadow-lg
// ArrowUp icon text-foreground
export function BackToTop()
```

---

## button-group.tsx

```tsx
// ButtonGroup: groups buttons, removes inner border-radius/borders
// orientation: "horizontal" (default) | "vertical"
// ButtonGroupText: label/adornment div with border bg-muted
// ButtonGroupSeparator: Separator between items
export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, buttonGroupVariants }
```

---

## empty.tsx

```tsx
// Empty: centered flex column with dashed border
// EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent
// EmptyMedia: variant "default" (transparent) | "icon" (size-10 rounded-xl bg-muted)
export { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia }
```

---

## form.tsx

```tsx
"use client"
// React Hook Form integration
// Form (= FormProvider), FormField (Controller wrapper), FormItem (grid gap-2)
// FormLabel: shows destructive color on error
// FormControl: Slot with aria-describedby/aria-invalid wired up
// FormDescription: text-sm text-muted-foreground
// FormMessage: text-sm text-destructive, shows error message
export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField }
```

---

## toggle.tsx

```tsx
"use client"
// toggleVariants: variant (default, outline), size (default h-9, sm h-8, lg h-10)
// data-[state=on]:bg-accent data-[state=on]:text-accent-foreground
export { Toggle, toggleVariants }
```

---

## error-view.tsx

Custom error display component.

---

## data-table-pagination.tsx, data-table-toolbar.tsx, data-table-column-header.tsx, data-table-view-options.tsx

Supporting components for the DataTable.
