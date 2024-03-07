'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { GithubIcon, Loader2Icon } from 'lucide-react';
import { type z } from 'zod';

import { PATHS } from '@/config';

import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { NextLink } from '@/components/next-link';

import { cn } from '@/utils/helper';

import { signinWithGithub } from '../actions/signin';
import { signInUserReqSchema } from '../types';

export const SigninForm = () => {
  const form = useForm<z.infer<typeof signInUserReqSchema>>({
    resolver: zodResolver(signInUserReqSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit() {
    // const callbackURL = searchParams.get('callbackUrl') ?? PATHS.ADMIN_HOME;
    // const res = await signIn('credentials', {
    //   redirect: false,
    //   email: values.email,
    //   password: values.password,
    //   callbackUrl: `${window.location.origin}`,
    // });
    // if (res?.error) {
    //   toast({
    //     variant: 'destructive',
    //     title: '请求失败',
    //     description: res?.error,
    //   });
    // } else {
    //   toast({
    //     title: '请求成功',
    //     description: '登录成功，欢迎回来',
    //   });
    // }
    // router.push(callbackURL);
  }

  async function handleSignUpWithGithub() {
    await signinWithGithub();
  }

  return (
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

          <div className="flex justify-end ">
            <NextLink href={PATHS.AUTH_SIGNUP}>还没有账号？去注册</NextLink>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                或者
              </span>
            </div>
          </div>
          <Button
            variant="default"
            className="!w-full"
            type="button"
            onClick={handleSignUpWithGithub}
          >
            <GithubIcon size={16} className="mr-2 " /> 使用 Github 登录
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
};
