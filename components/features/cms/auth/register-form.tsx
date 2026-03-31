import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  return (
    <form className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium">Name</label>
        <Input placeholder="Full name" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <Input placeholder="you@example.com" type="email" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Password</label>
        <Input placeholder="Create a password" type="password" />
      </div>
      <Button className="w-full" type="submit">
        Create Account
      </Button>
      <p className="text-center text-sm text-muted">
        Already registered?{" "}
        <Link className="text-primary" href="/cms/login">
          Sign in
        </Link>
      </p>
    </form>
  );
}
