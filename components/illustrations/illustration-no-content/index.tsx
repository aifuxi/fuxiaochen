import * as React from "react";

import { cn } from "@/lib/utils";

import { IllustrationNoContentDark } from "./illustration-no-content-dark";
import { IllustrationNoContentLight } from "./illustration-no-content-light";

export function IllustrationNoContent(props: React.SVGProps<SVGSVGElement>) {
  return (
    <>
      <IllustrationNoContentDark
        {...props}
        className={cn(
          props.className,
          `
            hidden
            dark:block
          `,
        )}
      />
      <IllustrationNoContentLight
        {...props}
        className={cn(
          props.className,
          `
            block
            dark:hidden
          `,
        )}
      />
    </>
  );
}
