import * as React from "react";
import { useForm } from "react-hook-form";

import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import * as z from "zod";

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

import { showErrorToast } from "@/components/toast";

import { PATHS } from "@/constants";
import { authClient } from "@/lib/auth-client";

const FormSchema = z.object({
  email: z.string().email({ message: "请输入有效的邮箱地址" }),
  password: z
    .string()
    .min(6, { message: "密码最少需要6位" })
    .max(20, { message: "密码最多20位" }),
});

interface Props {
  isPending: boolean;
  startTransition: React.TransitionStartFunction;
}

export function SignInForm({ isPending, startTransition }: Props) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const { email, password } = data;
    startTransition(async () => {
      await authClient.signIn.email(
        {
          email,
          password,
          callbackURL: PATHS.ADMIN_HOME,
        },
        {
          onError: (error) => {
            showErrorToast(error?.error?.message || "系统错误");
          },
        },
      );
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        autoComplete="off"
      >
        <FormField
          control={form.control}
          name="email"
          disabled={isPending}
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
        <FormField
          control={form.control}
          name="password"
          disabled={isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>密码</FormLabel>
              <FormControl>
                <Input type="password" placeholder="请输入密码" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              登录中... <LoaderCircle className="ml-2 animate-spin" />
            </>
          ) : (
            "登录"
          )}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          还没有账号？
          <Link href={PATHS.AUTH_SIGN_UP} className={`text-primary underline`}>
            去注册
          </Link>
        </p>
      </form>
    </Form>
  );
}
