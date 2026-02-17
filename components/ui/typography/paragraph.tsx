import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const paragraphVariants = cva("mb-4 leading-relaxed", {
  variants: {
    type: {
      primary: "text-text",
      secondary: "text-text-secondary",
      success: "text-success",
      warning: "text-warning",
      danger: "text-error",
    },
    size: {
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
    },
  },
  defaultVariants: {
    type: "primary",
    size: "base",
  },
});

export interface ParagraphProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof paragraphVariants> {
  as?: "p" | "div";
}

const Paragraph = React.forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ className, type, size, as: Component = "p", ...props }, ref) => {
    return (
      <Component
        className={cn(paragraphVariants({ type, size, className }))}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={ref as any}
        {...props}
      />
    );
  },
);
Paragraph.displayName = "Paragraph";

export { Paragraph, paragraphVariants };
