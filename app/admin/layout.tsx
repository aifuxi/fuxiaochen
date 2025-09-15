"use client";

import * as React from "react";

import { SessionProvider } from "next-auth/react";

import { AdminLayoutV2 } from "@/features/admin";

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <SessionProvider>
      <AdminLayoutV2>{children}</AdminLayoutV2>
    </SessionProvider>
  );
}
