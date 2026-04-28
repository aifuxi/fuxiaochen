import type { Metadata } from "next";

import { AdminLayout } from "@/components/admin/admin-layout";

import { requireServerSession } from "@/lib/auth-session";
import { getCachedSiteSettings } from "@/lib/server/settings/service";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getCachedSiteSettings();

  return {
    icons: {
      icon: settings.general.logoUrl,
    },
    robots: {
      follow: false,
      index: false,
    },
  };
}

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
      }}
    >
      {children}
    </AdminLayout>
  );
}
