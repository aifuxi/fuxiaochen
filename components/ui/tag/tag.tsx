import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const tagVariants = cva(
  `
    inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors duration-150
    focus:ring-2 focus:ring-primary/20 focus:outline-none
  `,
  {
    variants: {
      variant: {
        default:
          `
            bg-accent text-accent-foreground
            hover:bg-accent/80
          `,
        primary:
          `
            border border-primary/20 bg-primary/10 text-primary
            hover:bg-primary/15
          `,
        secondary:
          `
            border border-secondary/20 bg-secondary/10 text-secondary-foreground
            hover:bg-secondary/15
          `,
        outline:
          `
            border border-border text-foreground
            hover:bg-accent
          `,
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
            className={`
              rounded-full p-0.5 transition-colors
              hover:bg-black/5
              dark:hover:bg-white/10
            `}
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
