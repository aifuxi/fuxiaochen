import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  return (
    <form className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <Input placeholder="you@example.com" type="email" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Password</label>
        <Input placeholder="••••••••" type="password" />
      </div>
      <Button className="w-full" type="submit">
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
