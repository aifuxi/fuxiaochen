import axios from "axios";
import PubSub from "pubsub-js";

import { EVENT_TOPICS } from "@/constants";

export const request = axios.create({
  baseURL: "/api",
});

request.interceptors.request.use((config) => {
  // config.headers["Authorization"] = `Bearer ${getToken()}`;
  return config;
});

request.interceptors.response.use((response) => {
  if (response.status === 200) {
    const resp = response.data;
    if (resp?.error) {
      PubSub.publish(EVENT_TOPICS.RequestError, resp.error);
      throw new Error(resp.error);
    }
  }

  return response.data?.data;
});
