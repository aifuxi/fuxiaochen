"use client";

import React from "react";

import { signOutWithGithub } from "@/actions/auth";

import { Button } from "@/components/ui/button";

export default function Page() {
  const [isPending, startTransition] = React.useTransition();

  function handleSignOutWithGithub() {
    startTransition(async () => {
      await signOutWithGithub();
    });
  }

  return (
    <div>
      dashboard
      <Button size="lg" onClick={handleSignOutWithGithub} disabled={isPending}>
        退出登录123
      </Button>
    </div>
  );
}
