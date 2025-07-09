import Link from "next/link";

import { PATHS } from "@/constants";

import { LoginForm } from "../components/login-form";

export function LoginPage() {
  return (
    <>
      <div className="text-base text-muted-foreground">欢迎回来 </div>
      <LoginForm />
      <div className="flex justify-end">
        <Link
          href={PATHS.AUTH_REGISTER}
          className="text-sm text-muted-foreground underline hover:text-secondary-foreground"
        >
          没有账号？去注册
        </Link>
      </div>
    </>
  );
}
