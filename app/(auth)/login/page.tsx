import type { Metadata } from "next";

import { ArrowUpRight, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

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
  if (await currentSession()) redirect("/admin");

  const { error } = await searchParams;

  return (
    <main className="login-page">
      <div className="login-grid" aria-hidden="true" />
      <div className="login-shell">
        <header className="login-header">
          <Link href="/" className="login-brand" aria-label="返回 fuxiaochen 首页">
            <span className="login-brand-mark">〰</span>
            <span>fuxiaochen</span>
          </Link>
          <span className="login-header-label">PERSONAL SPACE / 001</span>
        </header>

        <div className="login-content">
          <section className="login-story" aria-labelledby="login-story-title">
            <div className="login-index">
              <span className="login-index-dot" /> PRIVATE ACCESS — 01
            </div>
            <h1 id="login-story-title" className="login-story-title">
              一扇门，
              <br />
              <span>只为自己</span>打开。
            </h1>
            <p className="login-story-copy">
              想法、作品，还有未完成的故事。
              <br />
              从这里，回到自己的空间。
            </p>

            <div className="login-art" aria-hidden="true">
              <div className="login-art-ring login-art-ring-outer" />
              <div className="login-art-ring login-art-ring-middle" />
              <div className="login-art-ring login-art-ring-inner" />
              <div className="login-art-axis login-art-axis-horizontal" />
              <div className="login-art-axis login-art-axis-vertical" />
              <div className="login-art-core">
                <span>〰</span>
              </div>
              <span className="login-art-coordinate login-art-coordinate-top">X / 30.09</span>
              <span className="login-art-coordinate login-art-coordinate-bottom">Y / ∞</span>
            </div>
          </section>

          <section className="login-panel" aria-labelledby="login-title">
            <div className="login-panel-top">
              <span className="login-panel-icon">
                <LockKeyhole size={17} strokeWidth={1.7} aria-hidden="true" />
              </span>
              <span className="login-panel-code">AUTH / 01</span>
            </div>
            <div className="login-panel-heading">
              <p className="login-eyebrow">WELCOME BACK</p>
              <h2 id="login-title">
                欢迎回来<span className="login-title-dot">.</span>
              </h2>
              <p>输入你的凭据，继续未完成的事。</p>
            </div>
            <LoginForm invalidCredentials={error === "invalid"} />
            <div className="login-panel-bottom">
              <span>仅限私人访问</span>
              <span className="login-panel-bottom-icon">
                <ArrowUpRight size={14} aria-hidden="true" /> SECURE ENTRY
              </span>
            </div>
          </section>
        </div>

        <footer className="login-footer">
          <span>© FUXIAOCHEN</span>
          <span>MADE FOR WHAT COMES NEXT</span>
        </footer>
      </div>
    </main>
  );
}
