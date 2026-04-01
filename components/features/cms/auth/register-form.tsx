import Link from "next/link";
import { Eye, Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  return (
    <form className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-fg">Name</label>
        <div className="relative">
          <User className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-muted" />
          <Input className="h-12 rounded-[0.75rem] bg-surface pl-11" placeholder="Full name" />
        </div>
      </div>
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
          <Input className="h-12 rounded-[0.75rem] bg-surface pr-11 pl-11" placeholder="Create a password" type="password" />
          <Eye className="absolute top-1/2 right-4 size-[18px] -translate-y-1/2 text-muted" />
        </div>
        <div className="space-y-2 pt-1">
          <div className="flex gap-1">
            <span className="h-1 flex-1 rounded-full bg-error" />
            <span className="h-1 flex-1 rounded-full bg-warning" />
            <span className="h-1 flex-1 rounded-full bg-primary" />
          </div>
          <p className="text-xs text-muted">Strong password</p>
        </div>
      </div>
      <label className="flex items-start gap-3 text-sm leading-6 text-muted">
        <span className={`
          mt-1 flex size-[18px] items-center justify-center rounded-[4px] border border-border bg-surface
        `} />
        I agree to the terms and privacy policy.
      </label>
      <Button className="h-12 w-full rounded-[0.75rem] font-mono text-xs tracking-[0.16em] uppercase" type="submit">
        Create Account
      </Button>
      <p className="text-center text-sm text-muted">
        Already registered?{" "}
        <Link className="text-primary" href="/cms/login">
          Sign in
        </Link>
      </p>
      <div className="text-center text-xs text-muted">
        By continuing you join the SuperBlog editorial workspace.
      </div>
    </form>
  );
}
