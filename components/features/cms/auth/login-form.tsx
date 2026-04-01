import Link from "next/link";
import { Eye, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  return (
    <form className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-fg">Email</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-muted" />
          <Input className="h-12 rounded-[0.75rem] bg-surface pl-11" placeholder="you@example.com" type="email" />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-fg">Password</label>
        <div className="relative">
          <Lock className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-muted" />
          <Input className="h-12 rounded-[0.75rem] bg-surface pr-11 pl-11" placeholder="••••••••" type="password" />
          <Eye className="absolute top-1/2 right-4 size-[18px] -translate-y-1/2 text-muted" />
        </div>
      </div>
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-muted">
          <span className="flex size-[18px] items-center justify-center rounded-[4px] border border-border bg-surface" />
          Remember me
        </label>
        <button type="button" className={`
          text-primary transition-colors
          hover:text-primary-h
        `}>
          Forgot password?
        </button>
      </div>
      <Button className="h-12 w-full rounded-[0.75rem] font-mono text-xs tracking-[0.16em] uppercase" type="submit">
        Sign In
      </Button>
      <p className="text-center text-sm text-muted">
        Need an account?{" "}
        <Link className="text-primary" href="/cms/register">
          Create one
        </Link>
      </p>
    </form>
  );
}
