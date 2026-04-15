import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { avatarClassName, Avatar } from "./avatar";
import {
  Badge,
  badgeBaseClassName,
  badgeMutedClassName,
  badgePrimaryClassName,
} from "./badge";
import { checkboxClassName, Checkbox } from "./checkbox";
import { dialogBackdropClassName, dialogSurfaceClassName } from "./dialog";
import { inputFrameClassName, Input } from "./input";
import { dropdownMenuContentClassName } from "./menu";
import { selectPopupClassName, selectTriggerClassName, Select } from "./select";
import { switchRootClassName, switchThumbClassName, Switch } from "./switch";
import { tabsListClassName, Tabs, TabsContent, TabsList, tabsTriggerClassName, TabsTrigger } from "./tabs";
import { textareaClassName, Textarea } from "./textarea";

const renderMarkup = (element: ReactElement) => renderToStaticMarkup(element);

describe("editorial controls surface contracts", () => {
  it("uses the surface token for input", () => {
    expect(inputFrameClassName).toContain("bg-[color:var(--color-surface-1)]");
  });

  it("uses the line token for textarea", () => {
    expect(textareaClassName).toContain("border-[color:var(--color-line-default)]");
  });

  it("keeps select popup blur free", () => {
    expect(selectTriggerClassName).toContain("bg-[color:var(--color-surface-1)]");
    expect(selectPopupClassName).not.toContain("backdrop-blur");
  });

  it("uses an opaque dialog backdrop and surface", () => {
    expect(dialogBackdropClassName).toBe("fixed inset-0 z-40 bg-black/72");
    expect(dialogSurfaceClassName).not.toContain("bg-zinc-950/96");
  });

  it("keeps dropdown menu content blur free", () => {
    expect(dropdownMenuContentClassName).not.toContain("backdrop-blur");
  });

  it("keeps tabs editorial and light-weight", () => {
    expect(tabsListClassName).not.toContain("rounded-full");
    expect(tabsListClassName).toContain("bg-[color:var(--color-surface-1)]");
    expect(tabsTriggerClassName).not.toContain("rounded-full");
    expect(tabsTriggerClassName).not.toContain("data-[selected]:bg-primary");
    expect(tabsTriggerClassName).toContain("border-[color:var(--color-line-default)]");
  });

  it("keeps badge editorial and light-weight", () => {
    expect(badgeBaseClassName).not.toContain("rounded-full");
    expect(badgePrimaryClassName).not.toContain("bg-primary/12");
    expect(badgeMutedClassName).toContain("bg-[color:var(--color-surface-1)]");
    expect(badgeMutedClassName).toContain("border-[color:var(--color-line-default)]");
  });

  it("keeps switch editorial and not strongly filled", () => {
    expect(switchRootClassName).not.toContain("rounded-full");
    expect(switchRootClassName).not.toContain("data-[checked]:bg-primary/30");
    expect(switchRootClassName).toContain("border-[color:var(--color-line-default)]");
  });

  it("keeps checkbox and avatar on editorial surfaces", () => {
    expect(checkboxClassName).toContain("bg-[color:var(--color-surface-1)]");
    expect(checkboxClassName).toContain("border-[color:var(--color-line-default)]");
    expect(avatarClassName).toContain("bg-[color:var(--color-surface-1)]");
    expect(avatarClassName).toContain("border-[color:var(--color-line-default)]");
  });

  it("renders contract classes into stable component markup", () => {
    const inputMarkup = renderMarkup(createElement(Input, { placeholder: "标题" }));
    const textareaMarkup = renderMarkup(createElement(Textarea, { defaultValue: "摘要" }));
    const selectMarkup = renderMarkup(
      createElement(Select, {
        defaultValue: "draft",
        options: [
          { label: "Draft", value: "draft" },
          { label: "Published", value: "published" },
        ],
      }),
    );
    const badgeMarkup = renderMarkup(createElement(Badge, { variant: "primary" }, "Featured"));
    const avatarMarkup = renderMarkup(createElement(Avatar, { alt: "Codex", fallback: "CX" }));

    expect(inputMarkup).toContain(inputFrameClassName);
    expect(textareaMarkup).toContain(textareaClassName);
    expect(selectMarkup).toContain(selectTriggerClassName);
    expect(badgeMarkup).toContain(badgeBaseClassName);
    expect(badgeMarkup).toContain(badgePrimaryClassName);
    expect(avatarMarkup).toContain(avatarClassName);
  });

  it("renders tabs, checkbox, and switch with their contract classes", () => {
    const tabsMarkup = renderMarkup(
      createElement(
        Tabs,
        { defaultValue: "overview" },
        createElement(
          TabsList,
          null,
          createElement(TabsTrigger, { value: "overview" }, "Overview"),
          createElement(TabsTrigger, { value: "settings" }, "Settings"),
        ),
        createElement(TabsContent, { value: "overview" }, "Overview panel"),
      ),
    );
    const checkboxMarkup = renderMarkup(createElement(Checkbox, { defaultChecked: true }));
    const switchMarkup = renderMarkup(createElement(Switch, { defaultChecked: true }));

    expect(tabsMarkup).toContain(tabsListClassName);
    expect(tabsMarkup).toContain(tabsTriggerClassName);
    expect(checkboxMarkup).toContain(checkboxClassName);
    expect(switchMarkup).toContain(switchRootClassName);
    expect(switchMarkup).toContain(switchThumbClassName);
  });
});
