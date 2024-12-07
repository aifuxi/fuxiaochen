import * as React from "react";

import { SessionProvider } from "next-auth/react";

export default function Layout({ children }: React.PropsWithChildren) {
  return <SessionProvider>{children}</SessionProvider>;
}
