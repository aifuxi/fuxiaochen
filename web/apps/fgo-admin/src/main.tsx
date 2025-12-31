import ReactDOM from "react-dom/client";
import PubSub from "pubsub-js";

import "./index.css";

import { TOPIC_API_ERROR } from "@/constants/event-topics";
import { ConfigProvider, Toast } from "@douyinfe/semi-ui-19";
import { RouterProvider } from "react-router-dom";
import router from "@/router";

// 全局配置 Toast 组件
Toast.config({
  theme: "light",
});

// 监听 API 错误事件
PubSub.subscribe(TOPIC_API_ERROR, (_, msg: unknown) => {
  Toast.error({ content: String(msg) });
});

const rootElement = document.getElementById("root");
if (!rootElement?.innerHTML) {
  const root = ReactDOM.createRoot(rootElement!);
  root.render(
    <ConfigProvider>
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}
