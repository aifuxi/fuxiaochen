"use client";

import { Form } from "@base-ui/react/form";
import Link from "next/link";
import { toast } from "sonner";

import { TextField } from "@/components/ui/form-field";

type AuthCardProps = {
  mode: "login" | "register";
};

export function AuthCard({ mode }: AuthCardProps) {
  const isLogin = mode === "login";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <div className={`
        pointer-events-none fixed inset-0
        bg-[linear-gradient(180deg,rgba(16,185,129,0.12),transparent_30%),linear-gradient(135deg,rgba(99,102,241,0.08),transparent_55%)]
      `} />
      <div className={`
        pointer-events-none fixed inset-0
        bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]
        bg-[size:64px_64px]
      `} />
      <div className="relative z-10 w-full max-w-[420px]">
        <div className="mb-8 text-center">
          <Link className="inline-flex items-center gap-3 no-underline" href="/">
            <div className={`
              flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-black
            `}>SB</div>
            <span className="font-mono text-[1.75rem] font-bold text-foreground">
              Super<em className="text-primary not-italic">Blog</em>
            </span>
          </Link>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/3 p-8 backdrop-blur-xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 font-serif text-[1.75rem] font-semibold">{isLogin ? "Sign In" : "Sign Up"}</h1>
            <p className="text-[0.9375rem] text-muted">{isLogin ? "Enter your credentials to access the dashboard" : "Create your account to start publishing"}</p>
          </div>

          <Form
            className="space-y-4"
            onFormSubmit={(values) => {
              toast.success(`${isLogin ? "Signed in" : "Registered"} in the mock flow`, {
                description: JSON.stringify(values),
              });
            }}
          >
            {!isLogin ? <TextField label="Full Name" name="name" placeholder="Sarah Chen" /> : null}
            <TextField label="Email" name="email" placeholder="you@example.com" />
            <TextField label="Password" name="password" placeholder="••••••••" />
            {!isLogin ? <TextField label="Confirm Password" name="confirmPassword" placeholder="••••••••" /> : null}

            <button className="btn-primary-glow mt-2 w-full rounded-xl px-4 py-3 font-semibold" type="submit">
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </Form>

          <div className="mt-6 text-center text-sm text-muted">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <Link className="font-medium text-primary" href={isLogin ? "/cms/register" : "/cms/login"}>
              {isLogin ? "Sign up" : "Sign in"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
