'use client';

import { useBoolean } from 'ahooks';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { FormLoadingSpinner } from '../components/form-loading-spinner';
import { SignupForm } from '../components/signup-form';

export const SignupPage = () => {
  const [loading, { setTrue: showLoading, setFalse: hideLoading }] =
    useBoolean(false);

  return (
    <div className="w-screen h-screen grid place-content-center">
      <Card className="w-[320px] sm:w-full sm:max-w-none sm:min-w-[360px] relative">
        <FormLoadingSpinner loading={loading} />
        <CardHeader>
          <CardTitle>邮箱注册</CardTitle>
          <CardDescription>输入下面信息进行注册</CardDescription>
        </CardHeader>
        <SignupForm showLoading={showLoading} hideLoading={hideLoading} />
      </Card>
    </div>
  );
};
