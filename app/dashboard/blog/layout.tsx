import * as React from "react";

import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
};

export default function Layout({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}
