import axios, { AxiosError } from "axios";
import type { CommonResponse } from "fuxiaochen-types";
import PubSub from "pubsub-js";

import { getToken, setToken } from "@/utils/token";

import { TOPIC_API_ERROR } from "@/constants/event-topics";

import { showWarningToast } from "./toast";

const request = axios.create({
  baseURL: "/",
});

// 请求拦截器
request.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 在发送请求之前做些什么
  return config;
});

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const resp = response.data as CommonResponse<unknown>;

    // 检查响应状态码是否为 200，且业务状态码是否为 0
    if (resp?.code !== 0) {
      const msg = resp?.message || "系统错误，请联系管理员";
      PubSub.publish(TOPIC_API_ERROR, msg);
      return Promise.reject(msg);
    }

    return response;
  },
  (error: AxiosError) => {
    PubSub.publish(TOPIC_API_ERROR, error);

    if (error.response?.status === 401) {
      setToken("");
      showWarningToast("登录信息已失效，即将退出");
      setTimeout(() => {
        window.location.href = `/login`;
      }, 1000);
    }

    return Promise.reject(error);
  },
);

// 导出请求实例
export default request;
