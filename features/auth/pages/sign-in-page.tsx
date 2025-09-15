"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { IconBrandGithub } from "@/components/icons";
import { ModeToggle } from "@/components/mode-toggle";

import { PATHS } from "@/constants";

import { signInWithGithub } from "../actions/sign-in";
import { SignInForm } from "../components";

export const SignInPage = () => {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  return (
    <div className="grid h-screen w-screen place-content-center">
      <Card
        className={`
          relative w-[320px] rounded-3xl py-4
          sm:w-full sm:max-w-none sm:min-w-[360px]
        `}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>后台登录</span>
            <ModeToggle />
          </CardTitle>
          <CardDescription>选择你喜欢的方式进行登录</CardDescription>
        </CardHeader>
        <CardContent>
          <SignInForm isPending={isPending} startTransition={startTransition} />
        </CardContent>
        <CardFooter>
          <div className="grid w-full gap-4">
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
              variant="outline"
              className="!w-full"
              type="button"
              disabled={isPending}
              onClick={handleSignInWithGithub}
            >
              <IconBrandGithub className="mr-2 text-base" /> 使用 Github 登录
            </Button>
            <Button
              variant="secondary"
              className="!w-full"
              type="button"
              disabled={isPending}
              onClick={handleGoHome}
            >
              回首页
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );

  function handleSignInWithGithub() {
    startTransition(async () => {
      await signInWithGithub();
    });
  }

  function handleGoHome() {
    router.push(PATHS.SITE_HOME);
  }
};
