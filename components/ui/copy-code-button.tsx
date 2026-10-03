"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { Button } from "./button";

export function CopyCodeButton({ code, disabled = false }: { code: string; disabled?: boolean }) {
  const [feedback, setFeedback] = useState<{
    code: string;
    status: "idle" | "copying" | "copied" | "failed";
  }>({ code, status: "idle" });
  const status = feedback.code === code ? feedback.status : "idle";
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const operation = useRef(0);
  const feedbackId = useId();
  useEffect(() => {
    return () => {
      operation.current += 1;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  const copy = async () => {
    const request = ++operation.current;
    if (timer.current) clearTimeout(timer.current);
    setFeedback({ code, status: "copying" });
    try {
      await navigator.clipboard.writeText(code);
      if (operation.current !== request) return;
      setFeedback({ code, status: "copied" });
      timer.current = setTimeout(() => setFeedback({ code, status: "idle" }), 2000);
    } catch {
      if (operation.current === request) setFeedback({ code, status: "failed" });
    }
  };
  return (
    <div className="code-block-copy">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="code-block-copy-button"
        disabled={disabled || status === "copying"}
        onClick={copy}
        aria-label="复制代码"
        aria-describedby={feedbackId}
      >
        {status === "copied" ? (
          <Check size={14} aria-hidden="true" />
        ) : (
          <Copy size={14} aria-hidden="true" />
        )}
        {status === "copied" ? "已复制" : "复制代码"}
      </Button>
      <output
        id={feedbackId}
        aria-live="polite"
        className={status === "failed" ? "code-block-copy-error" : "sr-only"}
      >
        {status === "copied" ? "已复制" : status === "failed" ? "复制失败，请手动选择代码" : ""}
      </output>
    </div>
  );
}
