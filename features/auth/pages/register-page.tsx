import Link from "next/link";

import { PATHS } from "@/constants";

import { RegisterForm } from "../components/register-form";

export function RegisterPage() {
  return (
    <>
      <div className="text-muted-foreground text-base">注册新账号</div>
      <RegisterForm />
      <div className="flex justify-end">
        <Link
          href={PATHS.AUTH_LOGIN}
          className="text-muted-foreground underline text-sm hover:text-secondary-foreground"
        >
          已有账号？去登录
        </Link>
      </div>
    </>
  );
}
