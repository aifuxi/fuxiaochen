export type Theme = "dark" | "light";

export const themeStorageKey = "fuxiaochen:theme";
export const legacyThemeStorageKey = "fuxiaochen:design-spec:theme";
export const themeChangeEvent = "fuxiaochen-theme-change";

export function isTheme(value: unknown): value is Theme {
  return value === "dark" || value === "light";
}

// 固定脚本只接收允许的模式，首屏先应用偏好；不读取 Cookie 或改变页面缓存方式。
export const themeInitializationScript = `(()=>{let theme="dark";try{const saved=localStorage.getItem("${themeStorageKey}");const legacy=saved===null?localStorage.getItem("${legacyThemeStorageKey}"):null;const value=saved??legacy;if(value==="dark"||value==="light"){theme=value;if(saved===null)localStorage.setItem("${themeStorageKey}",value)}}catch{}document.documentElement.setAttribute("data-theme",theme)})();`;
