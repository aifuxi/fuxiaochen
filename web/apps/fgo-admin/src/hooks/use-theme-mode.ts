/* eslint-disable react-hooks/set-state-in-effect */
import { useLayoutEffect, useState } from "react";

export const Theme = {
  Light: "light",
  Dark: "dark",
} as const;
export type Theme = (typeof Theme)[keyof typeof Theme];

const THEME_KEY = "fgo:theme";

function getCachedThemeMode() {
  return localStorage.getItem(THEME_KEY);
}

function setCachedThemeMode(theme: Theme) {
  localStorage.setItem(THEME_KEY, theme);
}

export default function useThemeMode() {
  const [themeMode, setThemeMode] = useState<Theme>(Theme.Light);

  const changeTheme = (theme: Theme) => {
    setThemeMode(theme);
    const body = document.body;

    if (theme === Theme.Dark) {
      body.setAttribute("theme-mode", Theme.Dark);
      setCachedThemeMode(Theme.Dark);
    } else {
      body.setAttribute("theme-mode", Theme.Light);
      setCachedThemeMode(Theme.Light);
    }
  };

  function matchMode(e: MediaQueryListEvent) {
    if (e.matches) {
      changeTheme(Theme.Dark);
    } else {
      changeTheme(Theme.Light);
    }
  }

  useLayoutEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");

    if (getCachedThemeMode()) {
      changeTheme(getCachedThemeMode() as Theme);
    } else {
      changeTheme(mql.matches ? Theme.Dark : Theme.Light);
    }

    mql.addEventListener("change", matchMode);
    return () => {
      mql.removeEventListener("change", matchMode);
    };
  }, []);

  const toggleThemeMode = () => {
    changeTheme(themeMode === Theme.Light ? Theme.Dark : Theme.Light);
  };
  return {
    themeMode,
    toggleThemeMode,
  };
}
