import * as React from "react";

import { cn } from "@/lib/utils";

import { type Tag } from "../types";

interface TagPrefixIconProps {
  tag: Pick<Tag, "icon" | "iconDark">;
  className?: string;
}

export const TagPrefixIcon = ({ tag, className }: TagPrefixIconProps) => {
  return (
    <>
      {tag.icon && (
        <img
          src={tag.icon}
          className={cn(
            `
              mr-1 hidden h-4 w-4
              dark:inline-flex
            `,
            className,
          )}
          alt=""
        />
      )}
      {tag.iconDark && (
        <img
          src={tag.iconDark}
          className={cn(
            `
              mr-1 h-4 w-4
              dark:hidden
            `,
            className,
          )}
          alt=""
        />
      )}
    </>
  );
};
