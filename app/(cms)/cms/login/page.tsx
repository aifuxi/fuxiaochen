import { redirect } from "next/navigation";

import { AuthCard } from "@/components/blocks/auth-card";
import { getAuthSession } from "@/lib/auth";

export default async function CmsLoginPage() {
  const session = await getAuthSession();

  if (session) {
    redirect("/cms/dashboard");
  }

  return <AuthCard mode="login" />;
}
