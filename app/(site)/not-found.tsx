import type { Metadata } from "next";

import { SiteNotFoundStatus } from "@/components/site/site-not-found-status";

export const metadata: Metadata = {
  title: "页面未找到",
};

export default function SiteNotFound() {
  return <SiteNotFoundStatus />;
}
