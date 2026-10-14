"use client";

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";

type PreviewTheme = "dark" | "light";
type PreviewThemeValue = {
  theme: PreviewTheme;
  setTheme: (theme: PreviewTheme) => void;
};

const storageKey = "fuxiaochen:design-spec:theme";
const changeEvent = "design-spec-theme-change";
const PreviewThemeContext = createContext<PreviewThemeValue | null>(null);
let sessionTheme: PreviewTheme | undefined;

function readTheme(): PreviewTheme {
  if (sessionTheme) return sessionTheme;
  try {
    const savedTheme = localStorage.getItem(storageKey);
    if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
  } catch {
    // 存储不可用时使用默认值，后续切换仍可在内存中生效。
  }
  return "dark";
}

function subscribe(listener: () => void) {
  const syncStorage = (event: StorageEvent) => {
    if (event.key !== storageKey && event.key !== null) return;
    sessionTheme = undefined;
    listener();
  };
  window.addEventListener(changeEvent, listener);
  window.addEventListener("storage", syncStorage);
  return () => {
    window.removeEventListener(changeEvent, listener);
    window.removeEventListener("storage", syncStorage);
  };
}

function setTheme(nextTheme: PreviewTheme) {
  sessionTheme = nextTheme;
  try {
    localStorage.setItem(storageKey, nextTheme);
  } catch {
    // 记忆偏好失败不影响已经切换的预览。
  }
  window.dispatchEvent(new Event(changeEvent));
}

function serverTheme(): PreviewTheme {
  return "dark";
}

export function PreviewThemeProvider({ children }: { children: ReactNode }) {
  // 服务端与 hydration 使用同一默认值，再订阅本页独立的模式偏好。
  const theme = useSyncExternalStore(subscribe, readTheme, serverTheme);
  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <PreviewThemeContext.Provider value={value}>{children}</PreviewThemeContext.Provider>;
}

export function usePreviewTheme() {
  const value = useContext(PreviewThemeContext);
  if (!value) throw new Error("设计预览主题必须在 PreviewThemeProvider 内使用。");
  return value;
}
