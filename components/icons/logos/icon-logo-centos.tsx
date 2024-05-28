import React from "react";

import { cn } from "@/lib/utils";

export const IconLogoCentOS = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn("icon-[logos--centos-icon]", className)}
    ></span>
  );
};
