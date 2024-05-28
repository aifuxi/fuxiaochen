import React from "react";

import { cn } from "@/lib/utils";

export const IconSkillFigmaDark = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn("icon-[skill-icons--figma-dark]", className)}
    ></span>
  );
};

export const IconSkillFigmaLight = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn("icon-[skill-icons--figma-light]", className)}
    ></span>
  );
};
