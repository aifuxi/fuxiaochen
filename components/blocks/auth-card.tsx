"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { TextField } from "@/components/ui/form-field";
import { authClient } from "@/lib/auth-client";

type AuthCardProps = {
  mode: "login" | "register";
};

const loginSchema = z.object({
  email: z.email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const registerSchema = loginSchema
  .extend({
    name: z.string().trim().min(2, "Name must be at least 2 characters."),
    confirmPassword: z.string().min(8, "Please confirm your password."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export function AuthCard({ mode }: AuthCardProps) {
  const isLogin = mode === "login";
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const rawValues = {
      name: formData.get("name")?.toString() ?? "",
      email: formData.get("email")?.toString().trim() ?? "",
      password: formData.get("password")?.toString() ?? "",
      confirmPassword: formData.get("confirmPassword")?.toString() ?? "",
    };

    if (isLogin) {
      const parsedValues = loginSchema.safeParse(rawValues);

      if (!parsedValues.success) {
        toast.error(parsedValues.error.issues[0]?.message ?? "Please check your input.");

        return;
      }

      startTransition(() => {
        void (async () => {
          const { error } = await authClient.signIn.email({
            email: parsedValues.data.email,
            password: parsedValues.data.password,
            callbackURL: "/cms/dashboard",
          });

          if (error) {
            toast.error(error.message || "Failed to sign in.");

            return;
          }

          toast.success("Signed in successfully.");
          router.replace("/cms/dashboard");
          router.refresh();
        })();
      });

      return;
    }

    const parsedValues = registerSchema.safeParse(rawValues);

    if (!parsedValues.success) {
      toast.error(parsedValues.error.issues[0]?.message ?? "Please check your input.");

      return;
    }

    startTransition(() => {
      void (async () => {
        const { error } = await authClient.signUp.email({
          email: parsedValues.data.email,
          name: parsedValues.data.name,
          password: parsedValues.data.password,
          callbackURL: "/cms/dashboard",
        });

        if (error) {
          toast.error(error.message || "Failed to create your account.");

          return;
        }

        toast.success("Account created successfully.");
        router.replace("/cms/dashboard");
        router.refresh();
      })();
    });
  }

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

          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin ? (
              <TextField
                autoComplete="name"
                disabled={isPending}
                label="Full Name"
                name="name"
                placeholder="Sarah Chen"
              />
            ) : null}
            <TextField
              autoComplete="email"
              disabled={isPending}
              label="Email"
              name="email"
              placeholder="you@example.com"
              type="email"
            />
            <TextField
              autoComplete={isLogin ? "current-password" : "new-password"}
              disabled={isPending}
              label="Password"
              name="password"
              placeholder="••••••••"
              type="password"
            />
            {!isLogin ? (
              <TextField
                autoComplete="new-password"
                disabled={isPending}
                label="Confirm Password"
                name="confirmPassword"
                placeholder="••••••••"
                type="password"
              />
            ) : null}

            <button
              className={`
                btn-primary-glow mt-2 w-full rounded-xl px-4 py-3 font-semibold
                disabled:cursor-not-allowed disabled:opacity-60
              `}
              disabled={isPending}
              type="submit"
            >
              {isPending ? (isLogin ? "Signing In..." : "Creating Account...") : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

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
