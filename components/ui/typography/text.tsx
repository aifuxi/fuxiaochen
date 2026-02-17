import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textVariants = cva("transition-colors duration-200", {
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
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
  },
  defaultVariants: {
    type: "primary",
    size: "base",
    weight: "normal",
  },
});

export interface TextProps
  extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof textVariants> {
  as?: "span" | "p" | "div";
}

const Text = React.forwardRef<HTMLSpanElement, TextProps>(
  (
    { className, type, size, weight, as: Component = "span", ...props },
    ref,
  ) => {
    return (
      <Component
        className={cn(textVariants({ type, size, weight, className }))}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={ref as any}
        {...props}
      />
    );
  },
);
Text.displayName = "Text";

export { Text, textVariants };
