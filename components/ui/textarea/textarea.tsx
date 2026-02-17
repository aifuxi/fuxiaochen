import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textareaVariants = cva(
  `
    glass flex min-h-[80px] w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm
    text-surface-foreground ring-offset-background transition-all duration-200
    placeholder:text-muted-foreground
    focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none
    disabled:cursor-not-allowed disabled:opacity-50
  `,
  {
    variants: {
      size: {
        sm: "min-h-[60px] rounded-md px-2 py-1.5 text-xs",
        md: "min-h-[80px] rounded-lg px-3 py-2 text-sm",
        lg: "min-h-[120px] rounded-xl px-4 py-3 text-base",
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
