'use client';

import { useBoolean } from 'ahooks';

import { PATHS } from '@/config';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { LoadingSpinner } from '@/components/loading-spinner';
import { NextLink } from '@/components/next-link';

import { SigninForm } from '../components/signin-form';

export const SignInPage = () => {
  const [loading, { setTrue: showLoading, setFalse: hideLoading }] =
    useBoolean(false);

  return (
    <div className="w-screen h-screen grid place-content-center">
      <Card className="w-[320px] sm:w-full sm:max-w-none sm:min-w-[360px] relative">
        <LoadingSpinner loading={loading} />
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            登录 <NextLink href={PATHS.SITE_HOME}>回首页</NextLink>
          </CardTitle>
          <CardDescription>请输入你的邮箱和密码进行登录</CardDescription>
        </CardHeader>
        <SigninForm showLoading={showLoading} hideLoading={hideLoading} />
      </Card>
    </div>
  );
};
