"use client";

import React from "react";

import { cn } from "@/lib/utils";

type DetailSidebarProps = React.PropsWithChildren;

export const DetailSidebar = ({ children }: DetailSidebarProps) => {
  return (
    <div
      className={cn(
        "hidden h-fit pl-10 pr-4 py-10 sticky top-24",
        "wrapper:block wrapper:w-[200px] ",
        "2xl:w-[240px]",
      )}
    >
      {children}
    </div>
  );
};
