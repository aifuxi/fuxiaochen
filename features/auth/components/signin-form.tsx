'use client';

import React from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { type z } from 'zod';

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
import { showErrorToast, showSuccessToast } from '@/components/ui/toast';

import { IconBaranGithub, IconSolarRestartLinear } from '@/components/icons';
import { NextLink } from '@/components/next-link';

import { PATHS } from '@/constants';
import { cn } from '@/lib/utils';

import { signinWithCredentials, signinWithGithub } from '../actions/signin';
import { type SigninDTO, signinSchema } from '../types';

export const SigninForm = () => {
  const form = useForm<z.infer<typeof signinSchema>>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} autoComplete="off">
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
            <IconSolarRestartLinear
              className={cn(
                'mr-2 animate-spin text-base',
                form.formState.isSubmitting ? '' : 'hidden',
              )}
            />
            登录
          </Button>
          <Button type="reset" variant="outline">
            重置
          </Button>

          <div className="flex justify-end ">
            <NextLink href={PATHS.AUTH_SIGNUP}>
              还没有账号？去用邮箱注册
            </NextLink>
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
            <IconBaranGithub className="mr-2 text-base" /> 使用 Github 登录
          </Button>
        </CardFooter>
      </form>
    </Form>
  );

  async function handleSubmit(values: SigninDTO) {
    try {
      await signinWithCredentials(values);
      showSuccessToast('登录成功');
    } catch (error) {
      showErrorToast((error as Error).message);
    }
  }

  async function handleSignUpWithGithub() {
    try {
      await signinWithGithub();
      showSuccessToast('登录成功');
    } catch (error) {
      showErrorToast((error as Error).message);
    }
  }
};
