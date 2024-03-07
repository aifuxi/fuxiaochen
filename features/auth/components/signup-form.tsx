'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon } from 'lucide-react';

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
import { useToast } from '@/components/ui/use-toast';

import { NextLink } from '@/components/next-link';

import { cn } from '@/utils/helper';

import { createUser } from '@/features/user';

import { type SignupDTO, signupSchema } from '../types';

export type SignupFormProps = {
  showLoading: () => void;
  hideLoading: () => void;
};

export const SignupForm = ({ showLoading, hideLoading }: SignupFormProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<SignupDTO>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>昵称</FormLabel>
                  <FormControl>
                    <Input placeholder="昵称" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>邮箱</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
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
                    <Input type="password" placeholder="密码" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
        <CardFooter className="grid gap-4">
          <div className="grid grid-cols-2 gap-4 ">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              <Loader2Icon
                size={16}
                className={cn(
                  'mr-2 animate-spin',
                  form.formState.isSubmitting ? '' : 'hidden',
                )}
              />
              注册
            </Button>
            <Button type="reset" variant="outline">
              重置
            </Button>
          </div>
          <div className="flex justify-end">
            <NextLink href={PATHS.AUTH_SIGNIN}>已有账号？去登录</NextLink>
          </div>
        </CardFooter>
      </form>
    </Form>
  );

  async function handleSubmit(values: SignupDTO) {
    showLoading();
    const resp = await createUser(values);
    hideLoading();
    if (!resp?.error) {
      toast({
        variant: 'destructive',
        title: '注册失败',
        description: resp?.error,
      });
      return;
    }

    toast({
      title: '请求成功',
      description: '注册成功，赶快登录吧～',
    });
    router.push(PATHS.AUTH_SIGNIN);
  }
};
