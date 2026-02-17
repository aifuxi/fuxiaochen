import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const titleVariants = cva("tracking-tight text-text", {
  variants: {
    level: {
      1: `
        text-3xl font-bold
        lg:text-4xl
      `,
      2: "text-2xl font-semibold",
      3: "text-xl font-semibold",
      4: "text-lg font-medium",
      5: "text-base font-medium",
      6: "text-sm font-medium",
    },
  },
  defaultVariants: {
    level: 1,
  },
});

export interface TitleProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof titleVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

type HeadingElement = HTMLHeadingElement;
type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

const Title = React.forwardRef<HeadingElement, TitleProps>(
  ({ className, level = 1, as, ...props }, ref) => {
    const tag: HeadingTag = as || (`h${level}` as HeadingTag);
    return React.createElement(tag, {
      className: cn(titleVariants({ level, className })),
      ref,
      ...props,
    });
  },
);
Title.displayName = "Title";

export { Title, titleVariants };
