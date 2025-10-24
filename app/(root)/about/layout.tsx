import * as React from "react";

import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "关于",
  description: "关于页面的描述",
};

export default function Layout({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}
