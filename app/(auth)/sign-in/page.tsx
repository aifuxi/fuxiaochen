'use client';

import { useForm } from 'react-hook-form';

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon } from 'lucide-react';
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
import { useToast } from '@/components/ui/use-toast';
import { PATHS } from '@/constants/path';
import { type SignInUserReq, signInUserReqSchema } from '@/typings/user';
import { cn } from '@/utils/helper';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof signInUserReqSchema>>({
    resolver: zodResolver(signInUserReqSchema),
    defaultValues: {
      email: '',
      password: '',
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
      toast({
        variant: 'destructive',
        title: '请求失败',
        description: res?.error,
      });
    } else {
      toast({
        title: '请求成功',
        description: '登录成功，欢迎回来',
      });
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
              <Button type="submit" disabled={form.formState.isSubmitting}>
                <Loader2Icon
                  size={16}
                  className={cn(
                    'mr-2 animate-spin',
                    form.formState.isSubmitting ? '' : 'hidden',
                  )}
                />
                登录
              </Button>
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
