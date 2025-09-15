"use client";

import * as React from "react";

import PubSub from "pubsub-js";

import { EVENT_TOPICS } from "@/constants";

import { showErrorToast } from "./toast";

export function GlobalPubSub() {
  React.useEffect(() => {
    PubSub.subscribe(EVENT_TOPICS.RequestError, (_, data) => {
      showErrorToast(data);
    });
  }, []);
  return null;
}
