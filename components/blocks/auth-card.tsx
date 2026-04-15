"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { CmsAuthFrame } from "@/components/cms/cms-auth-frame";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/form-field";
import { authClient } from "@/lib/auth-client";

type AuthCardProps = {
  mode: "login" | "register";
};

const loginSchema = z.object({
  email: z.email("请输入有效的邮箱地址。"),
  password: z.string().min(8, "密码至少需要 8 个字符。"),
});

const registerSchema = loginSchema
  .extend({
    name: z.string().trim().min(2, "姓名至少需要 2 个字符。"),
    confirmPassword: z.string().min(8, "请确认您的密码。"),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "两次密码输入不一致。",
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
        toast.error(parsedValues.error.issues[0]?.message ?? "请检查您的输入。");

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
            toast.error(error.message || "登录失败。");

            return;
          }

          toast.success("登录成功。");
          router.replace("/cms/dashboard");
          router.refresh();
        })();
      });

      return;
    }

    const parsedValues = registerSchema.safeParse(rawValues);

    if (!parsedValues.success) {
      toast.error(parsedValues.error.issues[0]?.message ?? "请检查您的输入。");

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
          toast.error(error.message || "创建账户失败。");

          return;
        }

        toast.success("账户创建成功。");
        router.replace("/cms/dashboard");
        router.refresh();
      })();
    });
  }

  return (
    <CmsAuthFrame
      description={isLogin ? "输入凭据以访问仪表盘。" : "创建账户以开始发布内容。"}
      title={isLogin ? "登录" : "注册"}
    >
      <div className="space-y-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin ? (
            <TextField
              autoComplete="name"
              disabled={isPending}
              label="姓名"
              name="name"
              placeholder="张三"
            />
          ) : null}
          <TextField
            autoComplete="email"
            disabled={isPending}
            label="邮箱"
            name="email"
            placeholder="you@example.com"
            type="email"
          />
          <TextField
            autoComplete={isLogin ? "current-password" : "new-password"}
            disabled={isPending}
            label="密码"
            name="password"
            placeholder="••••••••"
            type="password"
          />
          {!isLogin ? (
            <TextField
              autoComplete="new-password"
              disabled={isPending}
              label="确认密码"
              name="confirmPassword"
              placeholder="••••••••"
              type="password"
            />
          ) : null}

          <Button className="mt-2 w-full rounded-xl" disabled={isPending} type="submit">
            {isPending ? (isLogin ? "登录中..." : "创建账户...") : isLogin ? "登录" : "创建账户"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted">
          {isLogin ? "还没有账户？" : "已有账户？"}{" "}
          <Link className="font-medium text-primary" href={isLogin ? "/cms/register" : "/cms/login"}>
            {isLogin ? "注册" : "登录"}
          </Link>
        </div>
      </div>
    </CmsAuthFrame>
  );
}
