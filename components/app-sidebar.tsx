"use client";

import * as React from "react";

import Image from "next/image";

import {
  AudioWaveform,
  BookOpen,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  SquareTerminal,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import { NavManagement } from "@/components/nav-management";
import { NavUser } from "@/components/nav-user";

import { ImageAssets } from "@/constants";

import { NavOverview } from "./nav-overview";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "博客",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "列表",
          url: "#",
        },
        {
          title: "详情",
          url: "#",
        },
        {
          title: "创建",
          url: "#",
        },
        {
          title: "编辑",
          url: "#",
        },
      ],
    },
    {
      title: "代码片段",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "列表",
          url: "#",
        },
        {
          title: "详情",
          url: "#",
        },
        {
          title: "创建",
          url: "#",
        },
        {
          title: "编辑",
          url: "#",
        },
      ],
    },
    {
      title: "标签",
      url: "#",
      icon: BookOpen,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="pt-7 pl-4">
        <Image src={ImageAssets.logo} width={40} height={40} alt="" />
      </SidebarHeader>
      <SidebarContent>
        <NavOverview />
        <NavManagement items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
