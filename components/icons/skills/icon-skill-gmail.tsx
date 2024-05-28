import React from "react";

import { cn } from "@/lib/utils";

export const IconSkillGmailDark = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn("icon-[skill-icons--gmail-dark]", className)}
    ></span>
  );
};

export const IconSkillGmailLight = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn("icon-[skill-icons--gmail-light]", className)}
    ></span>
  );
};
