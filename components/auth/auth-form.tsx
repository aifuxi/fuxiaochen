"use client";

import { useState, type FormEvent } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Github, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { authClient } from "@/lib/auth-client";

import { routes } from "@/constants/routes";

type AuthFormProps = {
  githubEnabled: boolean;
  mode: "login" | "register";
  redirectTo: string;
};

const FORM_COPY = {
  login: {
    title: "欢迎回来",
    description: "使用邮箱密码或 GitHub 登录后台。",
    submitLabel: "登录",
    alternateHrefLabel: "创建账号",
    alternateHref: routes.auth.register,
    alternateHint: "还没有账号？",
  },
  register: {
    title: "创建账号",
    description: "注册后会自动登录，并跳转到后台。",
    submitLabel: "注册",
    alternateHrefLabel: "去登录",
    alternateHref: routes.auth.login,
    alternateHint: "已经有账号？",
  },
} as const;

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export function AuthForm({ githubEnabled, mode, redirectTo }: AuthFormProps) {
  const copy = FORM_COPY[mode];
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = getFormValue(formData, "name").trim();
    const email = getFormValue(formData, "email").trim().toLowerCase();
    const password = getFormValue(formData, "password");

    if (mode === "register" && !name) {
      setError("请输入昵称。");
      return;
    }

    if (!email) {
      setError("请输入邮箱地址。");
      return;
    }

    if (!password) {
      setError("请输入密码。");
      return;
    }

    if (password.length < 6) {
      setError("密码至少需要 6 位。");
      return;
    }

    setError(null);
    setIsEmailLoading(true);

    try {
      if (mode === "register") {
        const { error: signUpError } = await authClient.signUp.email({
          email,
          password,
          name,
        });

        if (signUpError) {
          setError(signUpError.message ?? "注册失败，请稍后再试。");
          return;
        }
      } else {
        const { error: signInError } = await authClient.signIn.email({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message ?? "登录失败，请检查邮箱和密码。");
          return;
        }
      }

      router.replace(redirectTo);
      router.refresh();
    } finally {
      setIsEmailLoading(false);
    }
  }

  async function handleGithubSignIn() {
    setError(null);
    setIsGithubLoading(true);

    try {
      const { error: socialError } = await authClient.signIn.social({
        provider: "github",
        callbackURL: redirectTo,
      });

      if (socialError) {
        setError(socialError.message ?? "GitHub 登录失败，请稍后再试。");
      }
    } finally {
      setIsGithubLoading(false);
    }
  }

  const alternateHref =
    redirectTo === routes.admin.root
      ? copy.alternateHref
      : `${copy.alternateHref}?next=${encodeURIComponent(redirectTo)}`;

  return (
    <Card className="border-border/70 bg-background/95 shadow-xl backdrop-blur">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">{copy.title}</CardTitle>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="name">昵称</Label>
              <Input
                id="name"
                name="name"
                placeholder="Fuxiaochen"
                autoComplete="nickname"
                disabled={isEmailLoading || isGithubLoading}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              disabled={isEmailLoading || isGithubLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="至少 6 位"
              autoComplete={
                mode === "register" ? "new-password" : "current-password"
              }
              disabled={isEmailLoading || isGithubLoading}
              required
            />
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isEmailLoading || isGithubLoading}
          >
            {isEmailLoading && <Loader2 className="animate-spin" />}
            {copy.submitLabel}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              或者
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGithubSignIn}
          disabled={!githubEnabled || isEmailLoading || isGithubLoading}
        >
          {isGithubLoading ? <Loader2 className="animate-spin" /> : <Github />}
          使用 GitHub 继续
        </Button>

        {!githubEnabled && (
          <p className="text-xs text-muted-foreground">
            当前环境未配置 `GITHUB_CLIENT_ID` 或 `GITHUB_CLIENT_SECRET`。
          </p>
        )}

        <p className="text-center text-sm text-muted-foreground">
          {copy.alternateHint}{" "}
          <Link href={alternateHref} className="font-medium text-foreground">
            {copy.alternateHrefLabel}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
