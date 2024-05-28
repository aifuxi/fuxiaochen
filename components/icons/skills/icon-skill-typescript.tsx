import React from "react";

import { cn } from "@/lib/utils";

export const IconSkillTypeScript = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn("icon-[skill-icons--typescript]", className)}
    ></span>
  );
};
