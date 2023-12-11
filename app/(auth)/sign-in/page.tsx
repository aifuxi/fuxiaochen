'use client';

import { useForm } from 'react-hook-form';

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { type z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PATHS } from '@/constants/path';
import { type SignInUserReq, signInUserReqSchema } from '@/typings/user';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const form = useForm<z.infer<typeof signInUserReqSchema>>({
    resolver: zodResolver(signInUserReqSchema),
    defaultValues: {
      email: 'aifuxi@aifuxi.cool',
      password: '123456',
    },
  });

  async function onSubmit(values: SignInUserReq) {
    const callbackURL = searchParams.get('callbackUrl') ?? PATHS.ADMIN_HOME;
    const res = await signIn('credentials', {
      redirect: false,
      email: values.email,
      password: values.password,
      callbackUrl: `${window.location.origin}`,
    });
    if (res?.error) {
      // TODO: 弹Toast
      // eslint-disable-next-line no-console
      console.error('出错了', res.error);
    } else {
      // TODO: 弹Toast
    }

    router.push(callbackURL);
  }

  return (
    <div className="w-screen h-screen grid place-content-center">
      <Card className="w-[320px] sm:w-full sm:max-w-none sm:min-w-[360px]">
        <CardHeader>
          <CardTitle>用户登录</CardTitle>
          <CardDescription>请输入你的邮箱和密码进行登录</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
            <CardContent>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>邮箱</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入邮箱地址" {...field} />
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
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="grid gap-2 ">
              {/* TODO: 表单提交的时候，登录按钮展示loading态 */}
              <Button type="submit">登录</Button>
              <Button type="reset" variant="outline">
                重置
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
