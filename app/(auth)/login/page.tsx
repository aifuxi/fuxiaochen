import type { Metadata } from "next";

import Link from "next/link";
import { redirect } from "next/navigation";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { currentSession } from "@/lib/auth";
import { getPublicSettings } from "@/lib/settings/service";

import { LoginForm } from "./login-form";
import "./login.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  return {
    title: `登录 · ${settings.title}`,
    description: `进入 ${settings.title} 的管理空间。`,
    robots: { index: false, follow: false },
  };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await currentSession()) redirect("/admin/posts");

  const { error } = await searchParams;

  return (
    <main className="login-page">
      <section data-page-motion className="login-panel" aria-labelledby="login-title">
        <div className="login-heading-actions">
          <Link href="/" className="login-brand" aria-label="返回付小晨首页">
            付小晨
          </Link>
          <ThemeToggle />
        </div>
        <h1 id="login-title">后台登录</h1>
        <LoginForm invalidCredentials={error === "invalid"} />
      </section>
    </main>
  );
}
