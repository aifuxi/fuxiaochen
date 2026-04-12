import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  `
    inline-flex items-center justify-center gap-2 rounded-xl font-medium whitespace-nowrap transition-all duration-300
    ease-[var(--ease-smooth)]
    focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none
    disabled:pointer-events-none disabled:opacity-50
  `,
  {
    variants: {
      variant: {
        primary: `
          bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(16,185,129,0.18),0_18px_40px_rgba(16,185,129,0.22)]
          hover:-translate-y-0.5 hover:brightness-110
        `,
        secondary: `
          bg-secondary text-secondary-foreground
          hover:bg-white/12
        `,
        ghost: `
          bg-transparent text-foreground
          hover:bg-white/6
        `,
        outline: `
          border border-white/12 bg-white/2 text-foreground
          hover:border-white/20 hover:bg-white/6
        `,
        destructive: `
          bg-destructive text-white
          hover:brightness-110
        `,
      },
      size: {
        sm: "h-9 px-4 text-xs",
        default: "h-11 px-5 text-sm",
        lg: "h-12 px-6 text-sm",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);
