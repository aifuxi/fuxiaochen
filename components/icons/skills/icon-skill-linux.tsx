import React from "react";

import { cn } from "@/lib/utils";

export const IconSkillLinuxDark = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn("icon-[skill-icons--linux-dark]", className)}
    ></span>
  );
};

export const IconSkillLinuxLight = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn("icon-[skill-icons--linux-light]", className)}
    ></span>
  );
};
