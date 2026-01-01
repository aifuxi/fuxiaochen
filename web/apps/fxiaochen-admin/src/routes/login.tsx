import { Button, Empty, Form, Layout, Typography } from "@douyinfe/semi-ui-19";
import { useNavigate } from "react-router-dom";
import { login, type LoginRequest } from "@/api/auth";
import { setToken } from "@/utils/token";
import { useRequest } from "ahooks";
import {
  IllustrationIdle,
  IllustrationIdleDark,
} from "@douyinfe/semi-illustrations";
import { showSuccessToast } from "@/libs/toast";
import { ROUTES } from "@/constants/route";
import ThemeModeChanger from "@/components/theme-mode-changer";
import { getUserInfo } from "@/api/user";
import useUserStore from "@/stores/use-user-store";

export default function Login() {
  const navigate = useNavigate();
  const setUserInfo = useUserStore((s) => s.setUserInfo);

  const { run: runGetUserInfo, loading: loadingGetUserInfo } = useRequest(
    getUserInfo,
    {
      manual: true,
      onSuccess(res) {
        setUserInfo(res.data);
        navigate(ROUTES.Home.href);
        showSuccessToast("登录成功");
      },
    }
  );

  const { loading, run } = useRequest(login, {
    manual: true,
    onSuccess(res) {
      setToken(res.data.token);
      runGetUserInfo();
    },
  });

  const finalLoading = loading || loadingGetUserInfo;

  return (
    <Layout className="relative h-svh flex flex-col">
      <Layout.Header className="px-8 py-6 flex items-center justify-between">
        <Typography.Title heading={4}>后台管理</Typography.Title>
        <ThemeModeChanger />
      </Layout.Header>
      <Layout.Content className="flex-1 h-full grid grid-cols-12">
        <div className="col-span-7 flex flex-col h-full justify-center items-center">
          <Empty
            image={<IllustrationIdle style={{ width: 400, height: 400 }} />}
            darkModeImage={
              <IllustrationIdleDark style={{ width: 400, height: 400 }} />
            }
            description={"神游四方"}
          />
        </div>
        <div className="col-span-5 flex flex-col h-full justify-center">
          <Typography.Title heading={2}>后台登录</Typography.Title>

          <Form<LoginRequest>
            disabled={finalLoading}
            layout="vertical"
            className="w-2xs"
            initValues={{ email: "admin@example.com", password: "123456" }}
            onSubmit={(values) => {
              run({
                email: values.email,
                password: values.password,
              });
            }}
          >
            <Form.Input
              field="email"
              label="邮箱"
              size="large"
              placeholder="请输入邮箱"
              showClear
              rules={[
                { required: true, message: "请输入邮箱" },
                { type: "email", message: "请输入正确的邮箱格式" },
              ]}
            ></Form.Input>
            <Form.Input
              field="password"
              label="密码"
              size="large"
              type="password"
              showClear
              placeholder="请输入密码"
              rules={[
                { required: true, message: "请输入密码" },
                { min: 6, message: "密码长度不能小于6位" },
                { max: 20, message: "密码长度不能大于20位" },
              ]}
            ></Form.Input>

            <Form.Slot noLabel>
              <Button
                theme="solid"
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={finalLoading}
              >
                登录
              </Button>
            </Form.Slot>
          </Form>
        </div>
      </Layout.Content>
    </Layout>
  );
}
