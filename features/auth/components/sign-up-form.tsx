"use client";

import { useForm } from "react-hook-form";

import { useRouter } from "next/navigation";

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

import { showErrorToast, showSuccessToast } from "@/components/toast";

import { PATHS } from "@/constants";

import { signUpWithEmail } from "../actions/sign-up";

const FormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "用户名最少需要2位" })
    .max(20, { message: "用户名最多20位" }),
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

export function SignUpForm({ isPending, startTransition }: Props) {
  const router = useRouter();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    startTransition(async () => {
      const res = await signUpWithEmail(data);
      if (res?.error) {
        showErrorToast(res.error);
        return;
      }
      showSuccessToast(res.message);
      router.replace(PATHS.ADMIN_HOME);
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
          name="name"
          disabled={isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>用户名</FormLabel>
              <FormControl>
                <Input placeholder="请输入用户名" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
              注册中... <LoaderCircle className="ml-2 animate-spin" />
            </>
          ) : (
            "注册"
          )}
        </Button>
      </form>
    </Form>
  );
}
