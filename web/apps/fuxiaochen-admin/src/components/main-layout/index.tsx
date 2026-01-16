import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import {
  IconArticle,
  IconBell,
  IconClock,
  IconEdit,
  IconExit,
  IconFolderOpen,
  IconHash,
  IconHelpCircle,
  IconHome,
  IconList,
  IconUser,
} from "@douyinfe/semi-icons";
import {
  Avatar,
  Button,
  Dropdown,
  Layout,
  Nav,
  Spin,
  Typography,
} from "@douyinfe/semi-ui-19";
import NiceModal from "@ebay/nice-modal-react";
import { useRequest } from "ahooks";

import { getUserInfo } from "@/api/user";
import { ROUTES } from "@/constants/route";
import useUserStore from "@/stores/use-user-store";

import LogoutConfirmModal from "./logout-confirm-modal";

import ThemeModeChanger from "../theme-mode-changer";

export default function MainLayout() {
  const { Header, Footer, Sider, Content } = Layout;

  const location = useLocation();
  const navigate = useNavigate();
  const userInfo = useUserStore((s) => s.userInfo);
  const setUserInfo = useUserStore((s) => s.setUserInfo);

  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const { loading } = useRequest(getUserInfo, {
    onSuccess(res) {
      setUserInfo(res.data);
    },
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedKeys([location.pathname ?? ROUTES.Home.href]);
  }, [location.pathname]);

  return (
    <Layout className="h-full">
      <Sider className="bg-semi-bg-1">
        <Nav
          style={{ maxWidth: 220, height: "100%" }}
          selectedKeys={selectedKeys}
          items={[
            {
              itemKey: ROUTES.Home.href,
              text: ROUTES.Home.name,
              icon: <IconHome size="large" />,
              onClick: () => {
                navigate(ROUTES.Home.href);
              },
            },
            {
              itemKey: ROUTES.Category.href,
              text: ROUTES.Category.name,
              icon: <IconFolderOpen size="large" />,
              onClick: () => {
                navigate(ROUTES.Category.href);
              },
            },
            {
              itemKey: ROUTES.Tag.href,
              text: ROUTES.Tag.name,
              icon: <IconHash size="large" />,
              onClick: () => {
                navigate(ROUTES.Tag.href);
              },
            },
            {
              itemKey: ROUTES.Blog.href,
              text: ROUTES.Blog.name,
              icon: <IconArticle size="large" />,
              items: [
                {
                  itemKey: ROUTES.BlogList.href,
                  text: ROUTES.BlogList.name,
                  icon: <IconList size="large" />,
                  onClick: () => {
                    navigate(ROUTES.BlogList.href);
                  },
                },
                {
                  itemKey: ROUTES.BlogCreate.href,
                  text: ROUTES.BlogCreate.name,
                  icon: <IconEdit size="large" />,
                  onClick: () => {
                    navigate(ROUTES.BlogCreate.href);
                  },
                },
              ],
            },
            {
              itemKey: ROUTES.Changelog.href,
              text: ROUTES.Changelog.name,
              icon: <IconClock size="large" />,
              onClick: () => {
                navigate(ROUTES.Changelog.href);
              },
            },
            {
              itemKey: ROUTES.User.href,
              text: ROUTES.User.name,
              icon: <IconUser size="large" />,
              onClick: () => {
                navigate(ROUTES.User.href);
              },
            },
          ]}
          header={{
            logo: <img src="/logo.svg" alt="" className="size-9 inline-flex" />,
            text: "付小晨后台",
          }}
          footer={{
            collapseButton: true,
          }}
        />
      </Sider>
      <Layout className="relative">
        <Header className="sticky top-0 z-10 bg-semi-bg-1">
          <Nav
            mode="horizontal"
            footer={
              <div className="flex items-center gap-3">
                <ThemeModeChanger />
                <Button
                  theme="borderless"
                  icon={<IconBell size="large" />}
                  className="text-semi-text-2!"
                />
                <Button
                  theme="borderless"
                  icon={<IconHelpCircle size="large" />}
                  className="text-semi-text-2!"
                />
                <Dropdown
                  position="bottomLeft"
                  render={
                    <Dropdown.Menu>
                      <Dropdown.Item>
                        <div className="flex items-center gap-4">
                          <Avatar size="small">{userInfo?.nickname}</Avatar>
                          <div>
                            <Typography.Text strong>
                              {userInfo?.nickname}
                            </Typography.Text>
                            <div>UID: {userInfo?.id}</div>
                          </div>
                        </div>
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item icon={<IconUser />}>
                        个人设置
                      </Dropdown.Item>
                      <Dropdown.Item
                        icon={<IconExit />}
                        onClick={() => NiceModal.show(LogoutConfirmModal)}
                      >
                        退出登录
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  }
                >
                  <div>
                    <Avatar size="small">{userInfo?.nickname}</Avatar>
                  </div>
                </Dropdown>
              </div>
            }
          ></Nav>
        </Header>
        <Content className="p-6 bg-semi-bg-0">
          <Spin spinning={loading} block size="large" tip="加载中...">
            <Outlet />
          </Spin>
        </Content>
        <Footer className="flex justify-between p-5 text-semi-text-2 bg-[rgba(var(--semi-grey-0),1)]">
          <span className="flex items-center">
            <span>
              Copyright © {new Date().getFullYear()} 付小晨。All Rights
              Reserved.
            </span>
          </span>
        </Footer>
      </Layout>
    </Layout>
  );
}
