import * as React from "react";

import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "用户管理",
};

export default function Layout({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}
