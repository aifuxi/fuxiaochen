"use client";

import { Form } from "@base-ui/react/form";
import Link from "next/link";
import { toast } from "sonner";

import { buttonVariants } from "@/components/ui/button-variants";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/form-field";
import { cn } from "@/lib/utils";

type AuthCardProps = {
  mode: "login" | "register";
};

export function AuthCard({ mode }: AuthCardProps) {
  const isLogin = mode === "login";

  return (
    <div className="shell-container flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <div className={`
        w-full max-w-lg rounded-[2rem] border border-white/8 bg-black/30 p-8 shadow-[0_30px_100px_rgba(0,0,0,0.45)]
        backdrop-blur-xl
      `}>
        <div className="mb-8 space-y-3">
          <div className="type-label">{isLogin ? "Sign In" : "Create Account"}</div>
          <h1 className="font-serif text-5xl tracking-[-0.05em]">{isLogin ? "Back to the editorial desk." : "Start the publishing workspace."}</h1>
          <p className="text-sm leading-6 text-muted">
            This first pass keeps auth mocked. The structure is ready for Better Auth once the real integration begins.
          </p>
        </div>

        <Form
          className="space-y-4"
          onFormSubmit={(values) => {
            toast.success(`${isLogin ? "Signed in" : "Registered"} in the mock flow`, {
              description: JSON.stringify(values),
            });
          }}
        >
          <TextField label="Email" name="email" placeholder="you@example.com" />
          <TextField label="Password" name="password" placeholder="••••••••" />
          {!isLogin ? <TextField label="Display Name" name="displayName" placeholder="Fuxiaochen" /> : null}
          <Button className="mt-2 w-full justify-center" type="submit">
            {isLogin ? "Enter CMS" : "Create Workspace"}
          </Button>
        </Form>

        <div className="mt-6 text-sm text-muted">
          {isLogin ? "Need an account?" : "Already have an account?"}{" "}
          <Link className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-auto px-0 text-primary")} href={isLogin ? "/cms/register" : "/cms/login"}>
            {isLogin ? "Register" : "Login"}
          </Link>
        </div>
      </div>
    </div>
  );
}
