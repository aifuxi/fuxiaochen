"use client";

import * as React from "react";

import { signInWithGithub } from "@/actions/auth";

import { cn } from "@/lib/utils";

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

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isPending, startTransition] = React.useTransition();

  function handleSignInWithGithub() {
    startTransition(async () => {
      await signInWithGithub();
    });
  }

  return (
    <div className={cn("flex flex-col gap-6 w-[420px]", className)} {...props}>
      <Card className="shadow-none border-none">
        <CardHeader className="mb-4">
          <CardTitle className="text-xl">登录你的账号</CardTitle>
          <CardDescription>
            没有账号?&nbsp;
            <a href="#" className="underline underline-offset-4">
              去注册
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form autoComplete="off">
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">邮箱</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="abc@abc.com"
                    required
                    disabled={isPending}
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">密码</Label>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      忘记密码?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    disabled={isPending}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isPending}
                >
                  登录
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
