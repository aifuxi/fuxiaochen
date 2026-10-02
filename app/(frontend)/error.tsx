"use client";
import { Button } from "@/components/ui/button";
export default function FrontendError({ reset }: { reset: () => void }) {
  return (
    <main id="main-content" className="site-main">
      <h1>暂时无法加载</h1>
      <p className="site-notice" role="alert">
        加载失败，请稍后重试。
      </p>
      <Button variant="secondary" onClick={reset}>
        重试
      </Button>
    </main>
  );
}
