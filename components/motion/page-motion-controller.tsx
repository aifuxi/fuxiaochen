"use client";

import { animate } from "motion/mini";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";

import { useMotionSettings } from "@/components/motion/motion-provider";

export function PageMotionController() {
  const pathname = usePathname();
  const previousPath = useRef<string | null>(null);
  const { ready, reducedMotion, standardDuration, ease, distance } = useMotionSettings();

  useLayoutEffect(() => {
    const previous = previousPath.current;
    previousPath.current = pathname;
    // 只响应已提交的路径变化；首次访问、query、刷新与偏好更新不重播。
    if (!previous || previous === pathname || !ready || reducedMotion) return undefined;

    const roots = Array.from(document.querySelectorAll<HTMLElement>("[data-page-motion]")).filter(
      (element) =>
        element.getClientRects().length > 0 && getComputedStyle(element).visibility !== "hidden",
    );
    // Next 可能保留隐藏的缓存页面；不触碰 Activity 中不可见的内容。
    if (roots.length !== 1) return undefined;
    const root = roots[0];
    const properties = ["opacity", "transform"] as const;
    const original = properties.map((name) => ({
      name,
      value: root.style.getPropertyValue(name),
      priority: root.style.getPropertyPriority(name),
    }));
    const hadStyle = root.hasAttribute("style");
    const existingAnimations = new Set(root.getAnimations());
    let animation: ReturnType<typeof animate> | undefined;
    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      // cancel 释放 WAAPI 效果；完成时 Motion 写入的最终样式也一并恢复。
      animation?.cancel();
      for (const { name, value, priority } of original) {
        if (value) root.style.setProperty(name, value, priority);
        else root.style.removeProperty(name);
      }
      if (!hadStyle && root.style.length === 0) root.removeAttribute("style");
    };

    try {
      animation = animate(
        root,
        {
          opacity: [0, 1],
          transform: [`translateY(${distance}px)`, "none"],
        },
        { duration: standardDuration, ease },
      );
      void animation.finished.then(cleanup, cleanup);
    } catch {
      // 动画能力不可用时保留静态正文，不阻断导航。
      for (const pending of root.getAnimations()) {
        if (!existingAnimations.has(pending)) pending.cancel();
      }
      cleanup();
    }
    return cleanup;
  }, [pathname, ready, reducedMotion, standardDuration, ease, distance]);

  return null;
}
