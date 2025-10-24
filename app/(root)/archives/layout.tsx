import * as React from "react";

import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "归档",
  description: "归档",
};

export default function Layout({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}
