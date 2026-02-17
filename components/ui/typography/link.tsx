import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const linkVariants = cva(
  "inline-flex items-center gap-1 transition-all duration-200 ease-apple",
  {
    variants: {
      underline: {
        true: "underline",
        false: "no-underline",
        hover: `
          no-underline
          hover:underline
        `,
      },
      disabled: {
        true: "pointer-events-none cursor-not-allowed text-text-tertiary",
        false: `
          text-accent
          hover:text-accent-hover-color
        `,
      },
    },
    defaultVariants: {
      underline: "hover",
      disabled: false,
    },
  },
);

export interface LinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">,
    VariantProps<typeof linkVariants> {
  href?: string;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, underline, disabled, href, target, ...props }, ref) => {
    const isExternal = target === "_blank" || href?.startsWith("http");

    return (
      <a
        className={cn(linkVariants({ underline, disabled, className }))}
        href={disabled ? undefined : href}
        target={target}
        rel={isExternal ? "noopener noreferrer" : undefined}
        ref={ref}
        {...props}
      >
        {props.children}
        {isExternal && !disabled && (
          <svg
            className="size-3.5 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        )}
      </a>
    );
  },
);
Link.displayName = "Link";

export { Link, linkVariants };
