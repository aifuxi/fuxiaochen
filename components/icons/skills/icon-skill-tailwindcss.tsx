import React from "react";

import { cn } from "@/lib/utils";

export const IconSkillTailwindcssDark = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn("icon-[skill-icons--tailwindcss-dark]", className)}
    ></span>
  );
};

export const IconSkillTailwindcssLight = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn("icon-[skill-icons--tailwindcss-light]", className)}
    ></span>
  );
};
