import * as React from "react";

import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "更新日志",
  description: "所有更新日志",
};

export default function Layout({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}
