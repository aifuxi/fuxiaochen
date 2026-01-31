"use client";

import { useState } from "react";

import { Github, Loader2, Mail } from "lucide-react";
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
        callbackURL: "/",
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
          callbackURL: "/",
        });
        if (error) {
          toast.error(error.message || "注册失败");
          setLoading(false);
          return;
        }
        toast.success("注册成功");
      } else {
        const { error } = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/",
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20 pb-20">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(123,97,255,0.05),transparent_60%)]" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="z-10 w-full max-w-md px-4">
        <div
          className={`
            group relative overflow-hidden rounded-xl border border-white/5 bg-cyber-gray/40 p-8 backdrop-blur-sm
            transition-all duration-500
            hover:border-neon-cyan/50 hover:shadow-[0_0_30px_rgba(0,255,255,0.1)]
          `}
        >
          {/* Scanning line effect */}
          <div
            className={`
              pointer-events-none absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-neon-purple/5 opacity-0
              transition-opacity duration-500
              group-hover:opacity-100
            `}
          />

          <div className="relative z-10 mb-8 text-center">
            <div
              className={`
                mb-4 inline-block rounded-full border border-neon-cyan/30 bg-neon-cyan/5 px-4 py-1 backdrop-blur-sm
              `}
            >
              <span className="text-xs tracking-[0.2em] text-neon-cyan uppercase">
                身份验证
              </span>
            </div>
            <h1
              className={`
                bg-gradient-to-br from-neon-cyan via-white to-neon-magenta bg-clip-text text-4xl font-black
                tracking-tighter text-transparent uppercase
              `}
            >
              {isSignUp ? "注册账号" : "系统接入"}
            </h1>
          </div>

          <div className="relative z-10 space-y-4">
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Input
                    placeholder="昵称"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className={`
                      border-white/10 bg-black/20 text-white
                      placeholder:text-gray-500
                      focus:border-neon-cyan focus:ring-neon-cyan/20
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
                    border-white/10 bg-black/20 text-white
                    placeholder:text-gray-500
                    focus:border-neon-cyan focus:ring-neon-cyan/20
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
                    border-white/10 bg-black/20 text-white
                    placeholder:text-gray-500
                    focus:border-neon-cyan focus:ring-neon-cyan/20
                  `}
                />
              </div>

              <Button
                type="submit"
                className={`
                  h-12 w-full bg-neon-cyan text-black transition-all duration-300
                  hover:bg-cyan-400 hover:shadow-[0_0_15px_rgba(0,255,255,0.5)]
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

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#12121a] px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <Button
              variant="outline"
              className={`
                h-12 w-full border-neon-cyan/50 bg-neon-cyan/5 text-neon-cyan transition-all duration-300
                hover:border-neon-cyan hover:bg-neon-cyan/20 hover:text-neon-cyan
                hover:shadow-[0_0_15px_rgba(0,255,255,0.3)]
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
                  text-gray-400 transition-colors
                  hover:text-neon-cyan
                `}
              >
                {isSignUp
                  ? "已有账号？点击登录"
                  : "没有账号？点击注册"}
              </button>
            </div>
          </div>

          <div className="relative z-10 mt-6 text-center text-xs text-gray-500">
            <p>访问系统即代表您同意相关协议。</p>
          </div>
        </div>
      </div>
    </main>
  );
}
