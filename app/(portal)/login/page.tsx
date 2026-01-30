"use client";

import { useState } from "react";

import { Github, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
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
              系统接入
            </h1>
          </div>

          <div className="relative z-10 space-y-4">
            <Button
              variant="outline"
              className={`
                h-12 w-full border-neon-cyan/50 bg-neon-cyan/5 text-neon-cyan transition-all duration-300
                hover:border-neon-cyan hover:bg-neon-cyan/20 hover:text-neon-cyan
                hover:shadow-[0_0_15px_rgba(0,255,255,0.3)]
              `}
              onClick={handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Github className="mr-2 h-4 w-4" />
              )}
              使用 GitHub 登录
            </Button>
          </div>

          <div className="relative z-10 mt-6 text-center text-xs text-gray-500">
            <p>访问系统即代表您同意相关协议。</p>
          </div>
        </div>
      </div>
    </main>
  );
}
