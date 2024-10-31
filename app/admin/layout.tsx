import * as React from "react";

import { SessionProvider } from "next-auth/react";

import { AdminLayout } from "@/features/admin";

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <SessionProvider>
      <AdminLayout>{children}</AdminLayout>
    </SessionProvider>
  );
}
