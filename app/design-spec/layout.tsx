import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fuxiaochen Afterglow · Design spec",
  description: "暗色材质、组件状态与流畅微交互的设计系统规范。",
};

export default function DesignSpecLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
