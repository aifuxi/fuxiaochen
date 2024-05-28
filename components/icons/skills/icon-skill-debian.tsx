import React from "react";

import { cn } from "@/lib/utils";

export const IconSkillDebianDark = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn("icon-[skill-icons--debian-dark]", className)}
    ></span>
  );
};

export const IconSkillDebianLight = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn("icon-[skill-icons--debian-light]", className)}
    ></span>
  );
};
