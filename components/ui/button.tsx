"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  `
    group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-transparent text-sm
    font-medium whitespace-nowrap transition-all outline-none select-none
    focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
    active:scale-[0.98]
    disabled:pointer-events-none disabled:opacity-50
    [&_svg]:pointer-events-none [&_svg]:shrink-0
    [&_svg:not([class*='size-'])]:size-4
  `,
  {
    variants: {
      variant: {
        default: `
          bg-primary text-primary-foreground
          hover:-translate-y-0.5 hover:brightness-110
          active:translate-y-0
        `,
        outline:
          `
            hover:border-border-hover hover:bg-secondary
            border-border bg-transparent
          `,
        secondary:
          `
            hover:bg-secondary-hover
            bg-secondary text-secondary-foreground
          `,
        ghost:
          `
            bg-transparent text-foreground
            hover:bg-secondary
          `,
        destructive:
          `
            bg-destructive text-destructive-foreground
            hover:brightness-110
          `,
        link: `
          text-primary underline-offset-4
          hover:underline
        `,
        "primary-glow": `
          before:rounded-inherit before:animate-pulse-glow before:absolute before:inset-0 before:z-[-1]
          before:bg-primary before:opacity-40 before:blur-xl
          relative overflow-hidden bg-primary text-primary-foreground
          hover:-translate-y-0.5 hover:brightness-110
        `,
      },
      size: {
        default:
          `h-10 px-5 py-2`,
        xs: `h-7 rounded-md px-3 text-xs`,
        sm: `h-8 rounded-lg px-4 text-sm`,
        lg: `h-11 rounded-lg px-8 text-base`,
        icon: "size-10",
        "icon-xs": "size-6 rounded-md",
        "icon-sm": "size-7 rounded-md",
        "icon-lg": "size-11 rounded-lg",
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
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
