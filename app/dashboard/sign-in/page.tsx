"use client";

import { useTransition } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { IconBrandGithub } from "@/components/icons";
import { ModeToggle } from "@/components/mode-toggle";

import { signInWithGithub } from "@/actions/auth";
import { PATHS } from "@/constants";
import { createClient } from "@/lib/supabase/client";

export default function Page() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="grid h-screen w-screen place-content-center">
      <Card className="relative w-[320px] animate-fade rounded-3xl py-4 sm:w-full sm:min-w-[360px] sm:max-w-none">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>欢迎回来👏🏻</span>
            <ModeToggle />
          </CardTitle>
          <CardDescription>请登录你的账号</CardDescription>
        </CardHeader>
        <CardFooter>
          <div className="grid w-full gap-4">
            <Button
              variant="default"
              className="!w-full"
              type="button"
              disabled={isPending}
              onClick={handleSignInWithGithub}
            >
              <IconBrandGithub className="mr-2 text-base" /> 使用 Github 登录
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  或者
                </span>
              </div>
            </div>
            <Button
              variant="default"
              className="!w-full"
              type="button"
              onClick={handleGoHome}
            >
              回首页
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );

  async function handleSignInWithGithub() {
    startTransition(async () => {
      await signInWithGithub();
    });
  }

  function handleGoHome() {
    router.push(PATHS.SITE_HOME);
  }
}
