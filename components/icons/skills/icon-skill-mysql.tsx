import React from "react";

import { cn } from "@/lib/utils";

export const IconSkillMysqlDark = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn("icon-[skill-icons--mysql-dark]", className)}
    ></span>
  );
};

export const IconSkillMysqlLight = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn("icon-[skill-icons--mysql-light]", className)}
    ></span>
  );
};
