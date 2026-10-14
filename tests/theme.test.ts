import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

import {
  legacyThemeStorageKey,
  themeInitializationScript,
  themeStorageKey,
} from "../components/theme/theme-contract";

function initialize({
  preferences = {},
  denyRead = false,
  denyWrite = false,
}: {
  preferences?: Record<string, string>;
  denyRead?: boolean;
  denyWrite?: boolean;
} = {}) {
  const storage = new Map(Object.entries(preferences));
  let theme: string | undefined;
  // 执行真正交付到 head 的脚本，验证 hydration 前的结果，而非复制选择逻辑。
  runInNewContext(
    themeInitializationScript,
    {
      localStorage: {
        getItem(key: string) {
          if (denyRead) throw new Error("测试存储读取不可用");
          return storage.get(key) ?? null;
        },
        setItem(key: string, value: string) {
          if (denyWrite) throw new Error("测试存储写入不可用");
          storage.set(key, value);
        },
      },
      document: {
        documentElement: {
          setAttribute(name: string, value: string) {
            assert.equal(name, "data-theme");
            theme = value;
          },
        },
      },
    },
    { timeout: 100 },
  );
  return { theme, storage };
}

void test("没有偏好和存储不可用时，首屏保持默认深色", () => {
  assert.equal(initialize().theme, "dark");
  assert.equal(initialize({ denyRead: true }).theme, "dark");
});

void test("绘制前应用全站偏好，且已保存的全站选择优先于旧工作台值", () => {
  for (const theme of ["dark", "light"]) {
    assert.equal(
      initialize({ preferences: { [themeStorageKey]: theme, [legacyThemeStorageKey]: "light" } })
        .theme,
      theme,
    );
  }
});

void test("首次推广继承工作台偏好并写入独立的全站键", () => {
  const { theme, storage } = initialize({ preferences: { [legacyThemeStorageKey]: "light" } });
  assert.equal(theme, "light");
  assert.equal(storage.get(themeStorageKey), "light");
});

void test("迁移偏好写入失败仍能正确绘制浅色", () => {
  assert.equal(
    initialize({ preferences: { [legacyThemeStorageKey]: "light" }, denyWrite: true }).theme,
    "light",
  );
});

void test("未知或非模式字符串不会进入 HTML 属性", () => {
  for (const invalid of ["", "auto", "LIGHT", 'light" onload="alert(1)'])
    assert.equal(initialize({ preferences: { [themeStorageKey]: invalid } }).theme, "dark");
});
