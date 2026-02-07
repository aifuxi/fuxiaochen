"use client";

import { useState } from "react";
import { Github, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
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
    } catch (_error) {
      toast.error("Login failed");
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
    } catch (error: any) {
      toast.error(error.message || "操作失败");
      setLoading(false);
    }
  };

  return (
    <main
      className={`
        relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bg-color)] px-4 pt-20 pb-20
      `}
    >
      {/* Background Sphere Effect */}
      <div
        className={`
          absolute top-1/2 left-1/2 -mt-64 -ml-64 h-128 w-128 -translate-x-1/2 -translate-y-1/2 rounded-full
          bg-[var(--accent-color)]/10 blur-[100px]
        `}
      />

      <div className="w-full max-w-md">
        <GlassCard className="rounded-2xl p-8 backdrop-blur-xl">
          <div className="relative z-10 mb-8 text-center">
            <div
              className={`
                mb-4 inline-flex items-center justify-center rounded-full bg-[var(--accent-color)]/10 px-4 py-1
              `}
            >
              <span className="text-xs font-medium tracking-wide text-[var(--accent-color)] uppercase">
                身份验证
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text-color)]">
              {isSignUp ? "注册账号" : "系统接入"}
            </h1>
            <p className="mt-2 text-sm text-[var(--text-color-secondary)]">
              {isSignUp ? "创建一个新账号以继续" : "输入您的凭证以访问管理系统"}
            </p>
          </div>

          <div className="relative z-10 space-y-6">
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Input
                    placeholder="昵称"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className={`
                      rounded-2xl border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-color)]
                      placeholder:text-gray-400
                      focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]/20
                    `}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="电子邮箱"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`
                    rounded-2xl border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-color)]
                    placeholder:text-gray-400
                    focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]/20
                  `}
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`
                    rounded-2xl border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-color)]
                    placeholder:text-gray-400
                    focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]/20
                  `}
                />
              </div>

              <Button
                type="submit"
                className={`
                  h-11 w-full bg-[var(--accent-color)] text-white
                  hover:bg-[var(--accent-color)]/90 hover:shadow-[var(--accent-color)]/20 hover:shadow-lg
                `}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                {isSignUp ? "注册" : "登录"}
              </Button>
            </form>

            <div className="relative flex items-center py-2">
              <div className="grow border-t border-[var(--glass-border)]"></div>
              <span className="shrink-0 px-4 text-xs font-medium text-[var(--text-color-secondary)] uppercase">
                Or continue with
              </span>
              <div className="grow border-t border-[var(--glass-border)]"></div>
            </div>

            <Button
              variant="outline"
              className={`
                h-11 w-full border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-color)]
                hover:border-[var(--accent-color)] hover:bg-[var(--accent-color)]/5 hover:text-[var(--accent-color)]
              `}
              onClick={handleSocialSignIn}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Github className="mr-2 h-4 w-4" />
              )}
              使用 GitHub 登录
            </Button>

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className={`
                  font-medium text-[var(--text-color-secondary)] transition-colors
                  hover:text-[var(--accent-color)]
                `}
              >
                {isSignUp ? "已有账号？点击登录" : "没有账号？点击注册"}
              </button>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-[var(--text-color-secondary)] opacity-70">
            <p>访问系统即代表您同意相关协议。</p>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
