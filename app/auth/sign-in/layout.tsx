import * as React from "react";

import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "登录",
};

export default function Layout({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}
