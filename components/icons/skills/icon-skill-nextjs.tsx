import React from "react";

import { cn } from "@/lib/utils";

export const IconSkillNextjsDark = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn("icon-[skill-icons--nextjs-dark]", className)}
    ></span>
  );
};

export const IconSkillNextjsLight = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn("icon-[skill-icons--nextjs-light]", className)}
    ></span>
  );
};
