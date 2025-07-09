import * as React from "react";

import { ImageAssets, WEBSITE } from "@/constants";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export const Logo = ({ className }: Props) => {
  return (
    <>
      <img
        src={ImageAssets.logoLight}
        className={cn("hidden h-8 w-8 dark:block", className)}
        alt={WEBSITE}
      />
      <img
        src={ImageAssets.logoDark}
        className={cn("h-8 w-8 dark:hidden", className)}
        alt={WEBSITE}
      />
    </>
  );
};
