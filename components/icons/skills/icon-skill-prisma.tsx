import React from "react";

import { cn } from "@/lib/utils";

export const IconSkillPrisma = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn("icon-[skill-icons--prisma]", className)}
    ></span>
  );
};
