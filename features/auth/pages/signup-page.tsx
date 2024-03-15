import { PATHS } from '@/config';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { NextLink } from '@/components/next-link';

import { SignupForm } from '../components/signup-form';

export const SignupPage = () => {
  return (
    <div className="w-screen h-screen grid place-content-center">
      <Card className="w-[320px] sm:w-full sm:max-w-none sm:min-w-[360px] relative">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            邮箱注册 <NextLink href={PATHS.SITE_HOME}>回首页</NextLink>
          </CardTitle>
          <CardDescription>输入下面信息进行注册</CardDescription>
        </CardHeader>
        <SignupForm />
      </Card>
    </div>
  );
};
