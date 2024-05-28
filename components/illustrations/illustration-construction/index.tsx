import React from "react";

import { cn } from "@/lib/utils";

import { IllustrationConstructionDark } from "./illustration-construction-dark";
import { IllustrationConstructionLight } from "./illustration-construction-light";

export function IllustrationConstruction(props: React.SVGProps<SVGSVGElement>) {
  return (
    <>
      <IllustrationConstructionDark
        {...props}
        className={cn(props.className, "hidden dark:block")}
      />
      <IllustrationConstructionLight
        {...props}
        className={cn(props.className, "block dark:hidden")}
      />
    </>
  );
}
