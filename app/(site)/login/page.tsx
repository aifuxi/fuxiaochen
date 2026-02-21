"use client";

import { useState } from "react";
import { ArrowRight, Github, Loader2, Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSocialSignIn = async () => {
    setLoading(true);
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/admin",
      });
    } catch {
      toast.error("登录失败");
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await authClient.signUp.email({
          email,
          password,
          name,
        });
        if (error) {
          toast.error(error.message || "注册失败");
          setLoading(false);
          return;
        }
        toast.success("注册成功");
        setLoading(false);
        setIsSignUp(false);
      } else {
        const { error } = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/admin",
        });
        if (error) {
          toast.error(error.message || "登录失败");
          setLoading(false);
          return;
        }
        toast.success("登录成功");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "操作失败";
      toast.error(message);
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-4 py-20">
      {/* Dynamic Gradient Orbs - Apple Liquid Style */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Primary Orb - Blue */}
        <div
          className="absolute -top-40 -left-40 h-125 w-125 animate-float-slow rounded-full opacity-60 blur-[80px]"
          style={{
            background:
              "radial-gradient(circle, rgba(0,113,227,0.4) 0%, rgba(0,113,227,0.1) 50%, transparent 70%)",
          }}
        />

        {/* Secondary Orb - Purple/Pink */}
        <div
          className={`
            absolute -right-20 -bottom-20 h-100 w-100 animate-float-medium rounded-full opacity-50 blur-[100px]
          `}
          style={{
            background:
              "radial-gradient(circle, rgba(191,90,242,0.35) 0%, rgba(191,90,242,0.1) 50%, transparent 70%)",
          }}
        />

        {/* Tertiary Orb - Teal */}
        <div
          className="absolute top-1/3 right-1/4 h-75 w-75 animate-float-fast rounded-full opacity-40 blur-[60px]"
          style={{
            background:
              "radial-gradient(circle, rgba(52,199,89,0.3) 0%, rgba(52,199,89,0.05) 50%, transparent 70%)",
          }}
        />

        {/* Accent Orb - Orange */}
        <div
          className="absolute bottom-1/4 left-1/3 h-50 w-50 animate-float-slow rounded-full opacity-30 blur-[50px]"
          style={{
            background:
              "radial-gradient(circle, rgba(255,149,0,0.3) 0%, rgba(255,149,0,0.05) 50%, transparent 70%)",
          }}
        />
      </div>

      {/* Subtle Noise Texture Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-105 animate-fade-in-up">
        {/* Header Section */}
        <div className="mb-10 text-center">
          {/* Badge */}
          <div
            className={`
              mb-6 inline-flex animate-fade-in-up items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5
              backdrop-blur-sm
            `}
            style={{ animationDelay: "100ms" }}
          >
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-medium tracking-wide text-accent">
              安全认证
            </span>
          </div>

          {/* Main Title - Bold Typography */}
          <h1
            className={`
              animate-fade-in-up text-4xl font-bold tracking-tight text-text
              sm:text-5xl
            `}
            style={{ animationDelay: "200ms" }}
          >
            {isSignUp ? "创建账号" : "欢迎回来"}
          </h1>

          {/* Subtitle */}
          <p
            className="mt-3 animate-fade-in-up text-base text-text-secondary"
            style={{ animationDelay: "300ms" }}
          >
            {isSignUp
              ? "注册以开始使用管理系统"
              : "登录以访问您的管理控制台"}
          </p>
        </div>

        {/* Glass Card */}
        <div
          className={`
            animate-fade-in-up rounded-3xl border border-white/10 bg-white/80 p-8 shadow-2xl shadow-black/5
            backdrop-blur-xl
            dark:border-white/5 dark:bg-white/5 dark:shadow-black/20
          `}
          style={{ animationDelay: "400ms" }}
        >
          <div className="space-y-6">
            {/* Form */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              {/* Name Field - Only for Sign Up */}
              <div
                className={`
                  grid transition-all duration-500 ease-apple
                  ${isSignUp ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}
                `}
              >
                <div className="overflow-hidden">
                  <div className="pb-4">
                    <Input
                      placeholder="您的昵称"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={isSignUp}
                      className={`
                        h-12 rounded-xl border-border/50 bg-surface/50 text-text backdrop-blur-sm transition-all
                        duration-200
                        placeholder:text-text-tertiary
                        focus:border-accent focus:bg-surface focus:ring-4 focus:ring-accent/10
                      `}
                    />
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div>
                <Input
                  type="email"
                  placeholder="电子邮箱"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`
                    h-12 rounded-xl border-border/50 bg-surface/50 text-text backdrop-blur-sm transition-all
                    duration-200
                    placeholder:text-text-tertiary
                    focus:border-accent focus:bg-surface focus:ring-4 focus:ring-accent/10
                  `}
                />
              </div>

              {/* Password Field */}
              <div>
                <Input
                  type="password"
                  placeholder="密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`
                    h-12 rounded-xl border-border/50 bg-surface/50 text-text backdrop-blur-sm transition-all
                    duration-200
                    placeholder:text-text-tertiary
                    focus:border-accent focus:bg-surface focus:ring-4 focus:ring-accent/10
                  `}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className={`
                  group relative h-12 w-full overflow-hidden rounded-xl bg-accent text-base font-medium text-white
                  shadow-lg shadow-accent/25 transition-all duration-300
                  hover:-translate-y-0.5 hover:bg-accent-hover-color hover:shadow-xl hover:shadow-accent/30
                  active:scale-[0.98]
                `}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Mail className="h-5 w-5" />
                      <span>{isSignUp ? "创建账号" : "登录"}</span>
                      <ArrowRight
                        className={`
                          h-4 w-4 transition-transform duration-200
                          group-hover:translate-x-1
                        `}
                      />
                    </>
                  )}
                </span>
              </Button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center gap-4 py-2">
              <div className="flex-1 border-t border-border/50" />
              <span className="text-xs font-medium tracking-wider text-text-tertiary uppercase">
                或
              </span>
              <div className="flex-1 border-t border-border/50" />
            </div>

            {/* Social Login */}
            <Button
              type="button"
              variant="outline"
              className={`
                group h-12 w-full rounded-xl border-border/50 bg-surface/30 text-text backdrop-blur-sm transition-all
                duration-300
                hover:border-accent/50 hover:bg-surface hover:shadow-lg
                active:scale-[0.98]
              `}
              onClick={handleSocialSignIn}
              disabled={loading}
            >
              <span className="flex items-center justify-center gap-3">
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Github
                      className={`
                        h-5 w-5 transition-transform duration-200
                        group-hover:scale-110
                      `}
                    />
                    <span className="font-medium">使用 GitHub 继续</span>
                  </>
                )}
              </span>
            </Button>

            {/* Toggle Sign Up / Sign In */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className={`
                  group inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors
                  duration-200
                  hover:text-accent
                `}
              >
                <span>{isSignUp ? "已有账号？" : "还没有账号？"}</span>
                <span
                  className={`
                    text-accent transition-transform duration-200
                    group-hover:translate-x-0.5
                  `}
                >
                  {isSignUp ? "立即登录" : "立即注册"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p
          className="mt-8 animate-fade-in-up text-center text-xs text-text-tertiary"
          style={{ animationDelay: "500ms" }}
        >
          继续即表示您同意我们的服务条款和隐私政策
        </p>
      </div>
    </main>
  );
}
