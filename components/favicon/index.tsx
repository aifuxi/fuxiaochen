"use client";

import React from "react";

import { useTheme } from "next-themes";

import { useFavicon } from "ahooks";

import { ImageAssets } from "@/constants";

export const Favicon = () => {
  const { resolvedTheme } = useTheme();
  const [url, setUrl] = React.useState<string>(ImageAssets.logoDark);
  useFavicon(url);

  React.useEffect(() => {
    // 根据主题动态切换favicon
    if (resolvedTheme === "dark") {
      // 黑暗模式下的 favicon
      setUrl(ImageAssets.logoLight);
    } else {
      // 其它时候的 favicon
      setUrl(ImageAssets.logoDark);
    }
  }, [resolvedTheme]);

  return null;
};
