import * as React from "react";

import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "博客",
  description: "所有博客",
};

export default function Layout({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}
