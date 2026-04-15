import { describe, expect, it } from "vitest";

import { inputFrameClassName } from "./input";
import { textareaClassName } from "./textarea";
import { selectPopupClassName, selectTriggerClassName } from "./select";
import { dialogBackdropClassName, dialogSurfaceClassName } from "./dialog";
import { dropdownMenuContentClassName } from "./menu";
import {
  badgeBaseClassName,
  badgeMutedClassName,
  badgePrimaryClassName,
} from "./badge";
import { switchRootClassName } from "./switch";
import { tabsListClassName, tabsTriggerClassName } from "./tabs";
import { avatarClassName } from "./avatar";
import { checkboxClassName } from "./checkbox";

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
});
