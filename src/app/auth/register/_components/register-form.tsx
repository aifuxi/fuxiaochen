"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useBoolean } from "ahooks";
import { Eye, EyeClosed, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

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

import { useCheckAdminUserExist, useRegister } from "../api";
import { type RegisterRequestType, registerSchema } from "../schema";

export function RegisterForm() {
  const [passwordVisible, { toggle: togglePasswordVisible }] =
    useBoolean(false);
  const form = useForm<RegisterRequestType>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "test",
      email: "test@test.com",
      password: "123456",
    },
  });
  const [errorMsg, setErrorMsg] = useState("");

  const router = useRouter();
  const { mutate, isPending: registerLoading } = useRegister();
  const { data, isPending } = useCheckAdminUserExist();

  const loading = useMemo(() => {
    return registerLoading || isPending;
  }, [registerLoading, isPending]);

  const buttonLabel = useMemo(() => {
    if (data?.data) {
      return "注册";
    } else {
      return "注册为管理员";
    }
  }, [data]);

  function handleSubmit(values: RegisterRequestType) {
    setErrorMsg("");
    mutate(values, {
      async onSuccess() {
        toast.success("注册成功！");
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>昵称</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入昵称" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
            disabled={loading}
          >
            {loading ? <LoaderCircle className="animate-spin" /> : buttonLabel}
          </Button>
          <div className="flex justify-end">
            <Link href="/auth/register" className="text-xs underline">
              已有账户？去登录
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
