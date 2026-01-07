import { IconMoon, IconSun } from "@douyinfe/semi-icons";
import { Button, Tooltip } from "@douyinfe/semi-ui-19";

import useThemeMode, { Theme } from "@/hooks/use-theme-mode";

export default function ThemeModeChanger() {
  const { themeMode, toggleThemeMode } = useThemeMode();

  return (
    <Button
      theme="borderless"
      icon={
        themeMode === Theme.Light ? (
          <Tooltip content="切换到暗色模式">
            <span className="grid place-content-center">
              <IconMoon size="large" />
            </span>
          </Tooltip>
        ) : (
          <Tooltip content="切换到亮色模式">
            <span className="grid place-content-center">
              <IconSun size="large" />
            </span>
          </Tooltip>
        )
      }
      className="text-semi-text-2!"
      onClick={() => {
        toggleThemeMode();
      }}
    />
  );
}
