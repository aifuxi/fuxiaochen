import { useTheme as useNextTheme } from "next-themes";

interface Coords {
  x: number;
  y: number;
}

type Theme = "light" | "dark";

export function useTheme() {
  const { theme: nextTheme, setTheme: setNextTheme } = useNextTheme();

  const handleThemeChange = (theme: Theme) => {
    setNextTheme(theme);
  };

  const toggleTheme = (coords?: Coords) => {
    // 参考代码：https://github.com/jnsahaj/tweakcn/blob/main/components/theme-provider.tsx
    const root = document.documentElement;
    const newMode = root.classList.contains("dark") ? "light" : "dark";

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // 不支持 startViewTransition 或 开启减弱动画效果 时，直接切换主题
    if (!document.startViewTransition || prefersReducedMotion) {
      handleThemeChange(newMode);
      return;
    }

    // 支持 startViewTransition 使用动画切换主题
    // 波浪动画效果
    if (coords) {
      root.style.setProperty("--x", `${coords.x}px`);
      root.style.setProperty("--y", `${coords.y}px`);
    }

    document.startViewTransition(() => {
      handleThemeChange(newMode);
    });
  };

  return {
    theme: nextTheme,
    setTheme: setNextTheme,
    toggleTheme,
  };
}
