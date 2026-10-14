"use client";

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";

import {
  isTheme,
  legacyThemeStorageKey,
  themeChangeEvent,
  themeStorageKey,
  type Theme,
} from "./theme-contract";

type ThemeValue = { theme: Theme; setTheme: (theme: Theme) => void };
const ThemeContext = createContext<ThemeValue | null>(null);
let sessionTheme: Theme | undefined;

function readTheme(): Theme {
  if (sessionTheme) return sessionTheme;
  try {
    const saved =
      localStorage.getItem(themeStorageKey) ?? localStorage.getItem(legacyThemeStorageKey);
    return isTheme(saved) ? saved : "dark";
  } catch {
    // 首屏脚本已应用的模式也是存储被禁用时的安全回退。
    const current = typeof document === "undefined" ? null : document.documentElement.dataset.theme;
    return isTheme(current) ? current : "dark";
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

function subscribe(listener: () => void) {
  const syncTheme = () => {
    applyTheme(readTheme());
    listener();
  };
  const syncStorage = (event: StorageEvent) => {
    if (event.key !== themeStorageKey && event.key !== legacyThemeStorageKey && event.key !== null)
      return;
    sessionTheme = undefined;
    syncTheme();
  };
  window.addEventListener(themeChangeEvent, syncTheme);
  window.addEventListener("storage", syncStorage);
  // 使用真实客户端快照，不在初次 hydration 时把首屏偏好覆盖为服务端默认值。
  applyTheme(readTheme());
  return () => {
    window.removeEventListener(themeChangeEvent, syncTheme);
    window.removeEventListener("storage", syncStorage);
  };
}

function setTheme(nextTheme: Theme) {
  sessionTheme = nextTheme;
  try {
    localStorage.setItem(themeStorageKey, nextTheme);
  } catch {
    // 存储失败仍保留当前会话的选择，并同步所有已打开的浮层。
  }
  applyTheme(nextTheme);
  window.dispatchEvent(new Event(themeChangeEvent));
}

function serverTheme(): Theme {
  return "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, readTheme, serverTheme);
  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("主题控件必须在 ThemeProvider 内使用。");
  return value;
}
