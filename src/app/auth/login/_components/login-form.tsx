"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useBoolean } from "ahooks";
import { Eye, EyeClosed, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { NICKNAME } from "@/constants/info";

import { useLogin } from "../api";
import { type LoginRequestType, loginSchema } from "../schema";

export function LoginForm() {
  const [passwordVisible, { toggle: togglePasswordVisible }] =
    useBoolean(false);
  const form = useForm<LoginRequestType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "test@test.com",
      password: "123456",
    },
  });
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const { mutate, isPending } = useLogin();

  function handleSubmit(values: LoginRequestType) {
    setErrorMsg("");
    mutate(values, {
      async onSuccess() {
        try {
          await signIn("credentials", {
            ...values,
            redirect: false,
          });
          router.push("/admin");
        } catch (error) {
          setErrorMsg(error as string);
        }
      },
      onError(error) {
        setErrorMsg(error.message);
      },
    });
  }

  return (
    <Form {...form}>
      <form autoComplete="off">
        <div className="grid w-[400px] gap-6">
          <img src="/images/fuxiaochen-logo.svg" className="mx-auto size-12" />
          <h1 className="text-center text-2xl font-bold">{NICKNAME}</h1>
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>邮箱</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入邮箱" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>密码</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <div className="relative w-full">
                        <Input
                          type={passwordVisible ? "text" : "password"}
                          placeholder="请输入密码"
                          {...field}
                        />
                        <div
                          className="absolute right-4 top-0 translate-y-1/2 cursor-pointer text-sm text-muted-foreground hover:text-primary"
                          onClick={togglePasswordVisible}
                        >
                          {passwordVisible ? (
                            <Eye className="size-5" />
                          ) : (
                            <EyeClosed className="size-5" />
                          )}
                        </div>
                      </div>
                    </FormControl>
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            className="w-full"
            type="button"
            onClick={() => form.handleSubmit(handleSubmit)()}
            disabled={isPending}
          >
            {isPending ? <LoaderCircle className="animate-spin" /> : "登录"}
          </Button>
          <div className="flex justify-end">
            <Link href="/auth/register" className="text-xs underline">
              没有账户？去注册
            </Link>
          </div>
          {Boolean(errorMsg) && (
            <p className="text-center text-sm text-destructive">{errorMsg}</p>
          )}
        </div>
      </form>
    </Form>
  );
}
