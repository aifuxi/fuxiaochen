import React from "react";

import { cn } from "@/lib/utils";

export const IconSkillNginx = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn("icon-[skill-icons--nginx]", className)}
    ></span>
  );
};
