"use client";

import { useForm } from "react-hook-form";

import { useRouter } from "@bprogress/next/app";
import { Button } from "@heroui/button";
import { zodResolver } from "@hookform/resolvers/zod";

// import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { showErrorToast } from "@/components/toast";

import { PATHS } from "@/constants";
import { setToken } from "@/utils";

import { type LoginRequest } from "../api";
import { useAuthLogin } from "../query";
import { loginSchema } from "../schema";

export function LoginForm() {
  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "test@test.com",
      password: "123456",
    },
  });

  const router = useRouter();

  const { mutate, isPending } = useAuthLogin();

  function onSubmit(values: LoginRequest) {
    mutate(values, {
      onSuccess(data) {
        setToken(data.token);
        router.push(PATHS.DASHBOARD);
      },
      onError(error) {
        showErrorToast(error?.message);
      },
    });
  }

  return (
    <div
      className={`
        w-[320px] px-4
        sm:w-[400px]
      `}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
          autoComplete="off"
          autoCapitalize="off"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>邮箱</FormLabel>
                <FormControl>
                  <Input
                    placeholder="请输入邮箱"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>密码</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="请输入密码"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isPending}>
            登录
          </Button>
        </form>
      </Form>
    </div>
  );
}
