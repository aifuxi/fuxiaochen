"use client";

import * as React from "react";

import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { PATHS } from "@/constants";

import { SignUpForm } from "../components";

export const SignUpPage = () => {
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
          <CardTitle>注册</CardTitle>
        </CardHeader>
        <CardContent>
          <SignUpForm isPending={isPending} startTransition={startTransition} />

          <CardDescription className="mt-4 text-right">
            已经有账户了？
            <Link href={PATHS.AUTH_SIGN_IN} className="text-primary underline">
              去登录
            </Link>
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
};
