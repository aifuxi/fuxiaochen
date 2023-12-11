'use client';

import { useForm } from 'react-hook-form';

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
import { type SignInUserReq, signInUserReqSchema } from '@/typings/user';

export default function SignInPage() {
  const form = useForm<z.infer<typeof signInUserReqSchema>>({
    resolver: zodResolver(signInUserReqSchema),
  });

  async function onSubmit(values: SignInUserReq) {}

  return (
    <div className="w-screen h-screen grid place-content-center">
      <Card className="min-w-[360px]">
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
            <CardFooter className="grid gap-8 grid-cols-4">
              <Button type="submit" className="col-span-3">
                登录
              </Button>
              <Button type="reset" variant="outline" className="col-span-1">
                重置
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
