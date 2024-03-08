'use client';

import { useBoolean } from 'ahooks';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { LoadingSpinner } from '@/components/loading-spinner';

import { SigninForm } from '../components/signin-form';

export const SignInPage = () => {
  const [loading, { setTrue: showLoading, setFalse: hideLoading }] =
    useBoolean(false);

  return (
    <div className="w-screen h-screen grid place-content-center">
      <Card className="w-[320px] sm:w-full sm:max-w-none sm:min-w-[360px] relative">
        <LoadingSpinner loading={loading} />
        <CardHeader>
          <CardTitle>登录</CardTitle>
          <CardDescription>请输入你的邮箱和密码进行登录</CardDescription>
        </CardHeader>
        <SigninForm showLoading={showLoading} hideLoading={hideLoading} />
      </Card>
    </div>
  );
};
