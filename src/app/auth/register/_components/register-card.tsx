"use client";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useBoolean } from "ahooks";
import { Eye, EyeClosed } from "lucide-react";

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

import { type RegisterRequestType, registerSchema } from "../schema";

export function RegisterCard() {
  const [passwordVisible, { toggle: togglePasswordVisible }] =
    useBoolean(false);
  const form = useForm<RegisterRequestType>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  function handleSubmit(_values: RegisterRequestType) {
    // console.log("_values", _values);

    void 0;
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
          >
            注册
          </Button>
        </div>
      </form>
    </Form>
  );
}
