import type { Metadata } from "next";

import { notFound } from "next/navigation";

import "./showcase.css";

export const metadata: Metadata = {
  title: "付小晨 Afterglow · Design spec",
  description: "设计工作台：在独立试验区查看视觉基础、组件状态与组合场景。",
};

export default function DesignSpecLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (process.env.NODE_ENV !== "development") notFound();
  return children;
}
