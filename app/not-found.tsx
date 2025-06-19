import * as React from "react";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="grid h-screen place-items-center">
      <div className="grid gap-8">
        <h3 className="text-center text-2xl font-semibold tracking-tight">
          页面未找到
        </h3>
        <Button asChild>
          <Link href="/">返回首页</Link>
        </Button>
      </div>
    </div>
  );
}
