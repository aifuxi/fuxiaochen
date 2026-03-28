import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  `
    group/badge inline-flex h-6 shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-md border
    border-transparent px-2.5 py-0.5 font-mono text-xs font-medium tracking-wider whitespace-nowrap uppercase
    transition-all
    focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50
    has-data-[icon=inline-end]:pr-1.5
    has-data-[icon=inline-start]:pl-1.5
    aria-invalid:border-destructive aria-invalid:ring-destructive/20
    [&>svg]:pointer-events-none [&>svg]:size-3!
  `,
  {
    variants: {
      variant: {
        default: `border-border bg-secondary text-foreground`,
        primary: `
          border-primary/30 bg-primary/15 text-primary
          [a]:hover:bg-primary/20
        `,
        secondary:
          `
            border-border bg-secondary text-muted-foreground
            [a]:hover:bg-secondary/80
          `,
        destructive:
          `
            border-destructive/30 bg-destructive/15 text-destructive
            focus-visible:ring-destructive/20
            [a]:hover:bg-destructive/20
          `,
        warning:
          `
            border-warning/30 bg-warning/15 text-warning
            [a]:hover:bg-warning/20
          `,
        outline:
          `
            border-border text-foreground
            [a]:hover:bg-muted [a]:hover:text-muted-foreground
          `,
        ghost:
          `hover:bg-secondary hover:text-foreground`,
        link: `
          text-primary underline-offset-4
          hover:underline
        `,
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
