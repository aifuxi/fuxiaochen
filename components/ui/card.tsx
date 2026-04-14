import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  `
    flex flex-col gap-6 rounded-md border border-border text-foreground shadow-sm transition-all
    duration-[var(--duration-normal)] ease-[var(--ease-smooth)]
  `,
  {
    variants: {
      variant: {
        default: "bg-card",
        glass: "bg-white/4 backdrop-blur-xl",
        spotlight: "spotlight-card bg-card",
        metric: "shimmer-border bg-card",
        article: "spotlight-card overflow-hidden bg-card",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Card({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant }), "px-6 py-6", className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        `
          @container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6
          has-data-[slot=card-action]:grid-cols-[1fr_auto]
          [.border-b]:pb-6
        `,
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("font-serif text-2xl leading-none", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        `
          flex items-center px-6
          [.border-t]:pt-6
        `,
        className,
      )}
      {...props}
    />
  );
}

export {
  Card,
  cardVariants,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
