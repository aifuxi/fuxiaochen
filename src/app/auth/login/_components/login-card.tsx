"use client";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useBoolean } from "ahooks";
import { Eye, EyeClosed } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.string().min(1, { message: "邮箱必填" }).email("邮箱格式错误"),
  password: z
    .string()
    .min(1, { message: "密码必填" })
    .max(20, { message: "密码长度超过20" }),
});

type LoginRequestType = z.infer<typeof loginSchema>;

export function LoginCard() {
  const [passwordVisible, { toggle: togglePasswordVisible }] =
    useBoolean(false);
  const form = useForm<LoginRequestType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function handleSubmit(_values: LoginRequestType) {
    void 0;
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">后台管理登录</CardTitle>
        <CardDescription>输入邮箱和密码进行登录</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Form {...form}>
          <form autoComplete="off">
            <div className="grid w-[320px] gap-4">
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
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          type="submit"
          onClick={() => form.handleSubmit(handleSubmit)()}
        >
          登录
        </Button>
      </CardFooter>
    </Card>
  );
}
