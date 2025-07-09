"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type DetailSidebarProps = React.PropsWithChildren;

export const DetailSidebar = ({ children }: DetailSidebarProps) => {
  return (
    <div
      className={cn(
        "sticky top-24 hidden h-fit py-10 pr-4 pl-10",
        "wrapper:block wrapper:w-[200px]",
        "2xl:w-[240px]",
      )}
    >
      {children}
    </div>
  );
};
