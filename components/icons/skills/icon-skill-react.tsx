import React from "react";

import { cn } from "@/lib/utils";

export const IconSkillReactDark = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn("icon-[skill-icons--react-dark]", className)}
    ></span>
  );
};

export const IconSkillReactLight = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn("icon-[skill-icons--react-light]", className)}
    ></span>
  );
};
