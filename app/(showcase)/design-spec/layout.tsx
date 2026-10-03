import type { Metadata } from "next";

import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Fuxiaochen Afterglow · Design spec",
  description: "暗色材质、组件状态与流畅微交互的设计系统规范。",
};

export default function DesignSpecLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (process.env.NODE_ENV !== "development") notFound();
  return children;
}
