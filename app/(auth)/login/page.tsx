'use client';

import { Button, Form, Typography } from '@douyinfe/semi-ui';

export default function LoginPage() {
  return (
    <div className="grid place-items-center min-h-screen">
      <div className="min-w-[400px] grid gap-4 border px-12 py-14 rounded-2xl shadow-2xl">
        <div className="w-full grid place-items-center ">
          <img
            src="/fuxiaochen.svg"
            alt="fuxiaochen logo"
            className="w-[72px] h-[72px]"
          />
        </div>
        <Typography.Title heading={2} className="text-center">
          欢迎回来
        </Typography.Title>
        <div className="w-full grid place-items-center ">
          <Typography.Text type="tertiary">登录后台管理账户</Typography.Text>
        </div>
        <Form autoComplete="off">
          <Form.Input
            label={{ text: '邮箱' }}
            field="email"
            placeholder="输入邮箱"
          />
          <Form.Input
            label={{ text: '密码' }}
            field="password"
            placeholder="输入密码"
          />
        </Form>
        <Button theme="solid">登录</Button>
        <Button>重置</Button>
      </div>
    </div>
  );
}
