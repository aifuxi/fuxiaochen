'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { IconBarandGithub } from '@/components/icons';
import { ModeToggle } from '@/components/mode-toggle';

import { PATHS } from '@/constants';

import { signinWithGithub } from '../actions/signin';

export const SignInPage = () => {
  const router = useRouter();

  return (
    <div className="w-screen h-screen grid place-content-center">
      <Card className="w-[320px] py-4 rounded-3xl sm:w-full sm:max-w-none sm:min-w-[360px] relative animate-fade">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>后台登录</span>
            <ModeToggle />
          </CardTitle>
          <CardDescription>选择你喜欢的方式进行登录</CardDescription>
        </CardHeader>
        <CardFooter>
          <div className="w-full grid gap-4">
            <Button
              variant="default"
              className="!w-full"
              type="button"
              onClick={handleSigninWithGithub}
            >
              <IconBarandGithub className="mr-2 text-base" /> 使用 Github 登录
            </Button>
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
              onClick={handleGoHome}
            >
              回首页
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );

  async function handleSigninWithGithub() {
    await signinWithGithub();
  }

  function handleGoHome() {
    router.push(PATHS.SITE_HOME);
  }
};
