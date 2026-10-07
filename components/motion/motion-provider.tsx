"use client";

import { domAnimation, LazyMotion, MotionConfig } from "motion/react";
import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from "react";

type MotionSettings = {
  ready: boolean;
  reducedMotion: boolean;
  quickDuration: number;
  standardDuration: number;
  ease: [number, number, number, number];
  distance: number;
};

// SSR 与 hydration 使用同一静态状态，动效参数只从共享 CSS token 读取。
const staticSettings: MotionSettings = {
  ready: false,
  reducedMotion: true,
  quickDuration: 0,
  standardDuration: 0,
  ease: [0, 0, 1, 1],
  distance: 0,
};

const MotionSettingsContext = createContext<MotionSettings>(staticSettings);

function readDuration(value: string) {
  // CSS 优化器可能把 150ms 写成 .15s，保留省略整数位的小数形式。
  const match = value.trim().match(/^(\d+(?:\.\d+)?|\.\d+)(ms|s)$/);
  return match ? Number(match[1]) / (match[2] === "ms" ? 1000 : 1) : NaN;
}

function readSettings(): MotionSettings {
  const style = getComputedStyle(document.documentElement);
  const quickDuration = readDuration(style.getPropertyValue("--motion-quick"));
  const standardDuration = readDuration(style.getPropertyValue("--motion-standard"));
  const curve = style
    .getPropertyValue("--motion-ease")
    .trim()
    .match(/^cubic-bezier\(([^)]+)\)$/);
  const values = curve?.[1].split(",").map(Number);
  const distanceToken = style
    .getPropertyValue("--motion-lift-max")
    .trim()
    .match(/^(\d+(?:\.\d+)?)px$/);
  if (
    !Number.isFinite(quickDuration) ||
    !Number.isFinite(standardDuration) ||
    !values ||
    values.length !== 4 ||
    !values.every(Number.isFinite) ||
    values[0] < 0 ||
    values[0] > 1 ||
    values[2] < 0 ||
    values[2] > 1 ||
    !distanceToken ||
    typeof Element.prototype.animate !== "function" ||
    typeof Element.prototype.getAnimations !== "function"
  )
    return staticSettings;

  return {
    ready: true,
    reducedMotion: false,
    quickDuration,
    standardDuration,
    ease: [values[0], values[1], values[2], values[3]],
    distance: Number(distanceToken[1]),
  };
}

export function MotionProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(staticSettings);

  useLayoutEffect(() => {
    const tokens = readSettings();
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSettings({ ...tokens, reducedMotion: preference.matches });
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  return (
    <MotionSettingsContext value={settings}>
      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </LazyMotion>
    </MotionSettingsContext>
  );
}

export function useMotionSettings() {
  return useContext(MotionSettingsContext);
}
