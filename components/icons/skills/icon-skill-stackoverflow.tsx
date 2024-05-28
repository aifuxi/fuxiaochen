import React from "react";

import { cn } from "@/lib/utils";

export const IconSkillStackoverflowDark = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn("icon-[skill-icons--stackoverflow-dark]", className)}
    ></span>
  );
};

export const IconSkillStackoverflowLight = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn("icon-[skill-icons--stackoverflow-light]", className)}
    ></span>
  );
};
