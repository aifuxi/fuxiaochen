"use client";

import { useState } from "react";
import { Github, Loader2, Mail, ArrowRight } from "lucide-react";
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
    <main className="relative flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-20">
      {/* Purple radial glow behind card */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{ zIndex: 0 }}
      >
        <div
          className="rounded-full blur-[80px]"
          style={{
            width: "400px",
            height: "300px",
            background: "var(--primary-glow)",
            opacity: 0.8,
          }}
        />
      </div>

      {/* Card */}
      <div
        className="relative z-10 w-full"
        style={{ maxWidth: "420px" }}
      >
        {/* Logo header */}
        <div className="mb-8 text-center">
          <div
            className="mb-6 inline-flex items-center gap-2"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "1rem",
              fontWeight: 500,
              letterSpacing: "-0.02em",
              color: "var(--foreground)",
            }}
          >
            <span>付小晨</span>
            <span className="logo-dot" />
          </div>
          <h1
            className="mb-2 font-bold"
            style={{
              fontSize: "1.75rem",
              letterSpacing: "-0.03em",
              color: "var(--foreground)",
            }}
          >
            {isSignUp ? "创建账号" : "欢迎回来"}
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--foreground-muted)",
            }}
          >
            {isSignUp ? "注册以开始使用管理系统" : "登录以访问您的管理控制台"}
          </p>
        </div>

        {/* Card body */}
        <div
          className="p-8"
          style={{
            background: "var(--background-elevated)",
            border: "1px solid var(--border)",
            borderRadius: "0.75rem",
          }}
        >
          <div className="space-y-5">
            {/* Form */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              {/* Name field - only for sign up */}
              <div
                className="grid transition-all duration-500 ease-in-out"
                style={{
                  gridTemplateRows: isSignUp ? "1fr" : "0fr",
                  opacity: isSignUp ? 1 : 0,
                }}
              >
                <div className="overflow-hidden">
                  <div className="pb-4">
                    <Input
                      placeholder="您的昵称"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={isSignUp}
                      className="h-11 transition-all duration-200"
                      style={{
                        background: "var(--background-subtle)",
                        border: "1px solid var(--border)",
                        borderRadius: "0.5rem",
                        color: "var(--foreground)",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <Input
                type="email"
                placeholder="电子邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`
                  h-11 transition-all duration-200
                  focus:ring-2 focus:ring-[var(--primary)]
                `}
                style={{
                  background: "var(--background-subtle)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.5rem",
                  color: "var(--foreground)",
                }}
              />

              {/* Password */}
              <Input
                type="password"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`
                  h-11 transition-all duration-200
                  focus:ring-2 focus:ring-[var(--primary)]
                `}
                style={{
                  background: "var(--background-subtle)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.5rem",
                  color: "var(--foreground)",
                }}
              />

              {/* Submit button */}
              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full font-semibold transition-all duration-300"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  borderRadius: "0.5rem",
                  fontSize: "0.9rem",
                  border: "none",
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      <span>{isSignUp ? "创建账号" : "登录"}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </span>
              </Button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center gap-4 py-1">
              <div
                className="flex-1"
                style={{ borderTop: "1px solid var(--border-subtle)" }}
              />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  color: "var(--foreground-subtle)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                或
              </span>
              <div
                className="flex-1"
                style={{ borderTop: "1px solid var(--border-subtle)" }}
              />
            </div>

            {/* GitHub button */}
            <Button
              type="button"
              variant="outline"
              className="group h-11 w-full transition-all duration-300"
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                color: "var(--foreground-muted)",
                borderRadius: "0.5rem",
              }}
              onClick={handleSocialSignIn}
              disabled={loading}
            >
              <span className="flex items-center justify-center gap-3">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Github className={`
                      h-4 w-4 transition-transform duration-200
                      group-hover:scale-110
                    `} />
                    <span
                      className="font-medium"
                      style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}
                    >
                      使用 GitHub 继续
                    </span>
                  </>
                )}
              </span>
            </Button>

            {/* Toggle sign up / sign in */}
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="inline-flex items-center gap-1.5 transition-colors duration-200"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  color: "var(--foreground-subtle)",
                }}
              >
                <span>{isSignUp ? "已有账号？" : "还没有账号？"}</span>
                <span style={{ color: "var(--primary)" }}>
                  {isSignUp ? "立即登录" : "立即注册"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer disclaimer */}
        <p
          className="mt-6 text-center"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            color: "var(--foreground-subtle)",
          }}
        >
          继续即表示您同意我们的服务条款和隐私政策
        </p>
      </div>
    </main>
  );
}
