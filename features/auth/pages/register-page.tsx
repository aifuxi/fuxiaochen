import Link from "next/link";

import { PATHS } from "@/constants";

import { RegisterForm } from "../components/register-form";

export function RegisterPage() {
  return (
    <>
      <div className="text-base text-muted-foreground">注册新账号</div>
      <RegisterForm />
      <div className="flex justify-end">
        <Link
          href={PATHS.AUTH_LOGIN}
          className={`
            text-sm text-muted-foreground underline
            hover:text-secondary-foreground
          `}
        >
          已有账号？去登录
        </Link>
      </div>
    </>
  );
}
