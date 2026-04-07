"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";

import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

type ButtonProps = React.ComponentPropsWithoutRef<typeof BaseButton> &
  VariantProps<typeof buttonVariants>;

export const Button = React.forwardRef<React.ElementRef<typeof BaseButton>, ButtonProps>(
  ({ className, size, variant, ...props }, ref) => {
    return <BaseButton ref={ref} className={cn(buttonVariants({ size, variant }), className)} {...props} />;
  },
);

Button.displayName = "Button";
