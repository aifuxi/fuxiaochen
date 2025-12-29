import Link from "next/link";

import { Button } from "@/components/ui/button";

import { IllustrationNotFound } from "@/components/illustrations";

import { PATHS } from "@/constants";

export default function Page() {
  return (
    <div className="grid h-screen place-items-center">
      <div className="grid gap-8">
        <IllustrationNotFound className="size-[320px]" />
        <h3 className="text-center text-2xl font-semibold tracking-tight">
          页面未找到
        </h3>
        <Button asChild>
          <Link href={PATHS.HOME}>返回首页</Link>
        </Button>
      </div>
    </div>
  );
}
