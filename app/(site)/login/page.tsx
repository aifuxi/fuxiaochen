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
      const message = error instanceof Error ? error.message : "操作失败";
      toast.error(message);
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="animate-float-slow absolute -top-40 -left-40 h-125 w-125 rounded-full opacity-60 blur-[80px]"
          style={{
            background:
              "radial-gradient(circle, rgba(16,185,129,0.34) 0%, rgba(16,185,129,0.08) 50%, transparent 72%)",
          }}
        />

        <div
          className={`
            animate-float-medium absolute -right-20 -bottom-20 h-100 w-100 rounded-full opacity-50 blur-[100px]
          `}
          style={{
            background:
              "radial-gradient(circle, rgba(59,130,246,0.22) 0%, rgba(59,130,246,0.06) 50%, transparent 70%)",
          }}
        />

        <div
          className="animate-float-fast absolute top-1/3 right-1/4 h-75 w-75 rounded-full opacity-40 blur-[60px]"
          style={{
            background:
              "radial-gradient(circle, rgba(16,185,129,0.22) 0%, rgba(16,185,129,0.03) 50%, transparent 70%)",
          }}
        />

        <div
          className="animate-float-slow absolute bottom-1/4 left-1/3 h-50 w-50 rounded-full opacity-30 blur-[50px]"
          style={{
            background:
              "radial-gradient(circle, rgba(245,158,11,0.18) 0%, rgba(245,158,11,0.03) 50%, transparent 70%)",
          }}
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Main Content */}
      <div className="animate-fade-in-up relative z-10 w-full max-w-105">
        {/* Header Section */}
        <div className="mb-10 text-center">
          <div
            className={`
              animate-fade-in-up mb-6 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5
              backdrop-blur-sm
            `}
            style={{ animationDelay: "100ms" }}
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium tracking-wide text-primary">
              安全认证
            </span>
          </div>

          <h1
            className={`
              animate-fade-in-up font-serif text-5xl tracking-tight text-foreground
              sm:text-6xl
            `}
            style={{ animationDelay: "200ms" }}
          >
            {isSignUp ? "创建账号" : "欢迎回来"}
          </h1>

          {/* Subtitle */}
          <p
            className="animate-fade-in-up mt-3 text-base text-muted-foreground"
            style={{ animationDelay: "300ms" }}
          >
            {isSignUp ? "注册以开始使用管理系统" : "登录以访问您的管理控制台"}
          </p>
        </div>

        <div
          className={`
            animate-fade-in-up rounded-[2rem] border border-white/10 bg-black/40 p-8 shadow-2xl shadow-black/30
            backdrop-blur-2xl
          `}
          style={{ animationDelay: "400ms" }}
        >
          <div className="space-y-6">
            {/* Form */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              {/* Name Field - Only for Sign Up */}
              <div
                className={`
                  ease-apple grid transition-all duration-500
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
                      className="h-12 rounded-md"
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
                  className="h-12 rounded-md"
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
                  className="h-12 rounded-md"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                variant="glow"
                className="group h-12 w-full rounded-md text-base"
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
              <span className="text-xs font-medium tracking-wider text-muted uppercase">
                或
              </span>
              <div className="flex-1 border-t border-border/50" />
            </div>

            {/* Social Login */}
            <Button
              type="button"
              variant="outline"
              className="group h-12 w-full rounded-md"
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
                  group inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors
                  duration-200
                  hover:text-primary
                `}
              >
                <span>{isSignUp ? "已有账号？" : "还没有账号？"}</span>
                <span
                  className={`
                    text-primary transition-transform duration-200
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
          className="animate-fade-in-up mt-8 text-center text-xs text-muted"
          style={{ animationDelay: "500ms" }}
        >
          继续即表示您同意我们的服务条款和隐私政策
        </p>
      </div>
    </main>
  );
}
