import * as React from "react";

import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "标签",
  description: "所有标签",
};

export default function Layout({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}
