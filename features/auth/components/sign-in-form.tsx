import * as React from "react";
import { useForm } from "react-hook-form";

import { signIn } from "next-auth/react";
import Link from "next/link";
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

import { showErrorToast } from "@/components/toast";

import { PATHS } from "@/constants";

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
  const router = useRouter();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    startTransition(async () => {
      const result = await signIn("credentials", {
        ...data,
        redirect: false,
      });

      if (result?.error) {
        showErrorToast(result.error);
        return;
      }

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
