import React from "react";

import { cn } from "@/lib/utils";

export const IconSkillNodejsDark = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn("icon-[skill-icons--nodejs-dark]", className)}
    ></span>
  );
};

export const IconSkillNodejsLight = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn("icon-[skill-icons--nodejs-light]", className)}
    ></span>
  );
};
