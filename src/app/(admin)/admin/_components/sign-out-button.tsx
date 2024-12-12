"use client";

import React from "react";

import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      variant="destructive"
      onClick={() => signOut({ redirectTo: "/auth/login" })}
    >
      退出登录
    </Button>
  );
}
