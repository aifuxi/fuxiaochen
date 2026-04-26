import type { Metadata } from "next";

import { AdminLayout } from "@/components/admin/admin-layout";

import { getSessionUserRole, requireServerSession } from "@/lib/auth-session";

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
};

export default async function AdminRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireServerSession();

  return (
    <AdminLayout
      user={{
        email: session.user.email,
        image: session.user.image,
        name: session.user.name,
        role: getSessionUserRole(session),
      }}
    >
      {children}
    </AdminLayout>
  );
}
