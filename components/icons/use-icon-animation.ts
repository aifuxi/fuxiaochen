"use client";

import { useAnimation } from "motion/react";
import { useContext, useEffect, useRef } from "react";

import { IconMotionContext } from "./motion-provider";

const scopeSelector =
  'button, a[href], [role="button"], [role="option"], [role="combobox"], [role="tab"], [data-icon-animation-scope]';

export function useIconAnimation() {
  const controls = useAnimation();
  const enabled = useContext(IconMotionContext);
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return undefined;

    const scope = svg.parentElement?.closest(scopeSelector) ?? svg;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = preference.matches;
    let hovered = false;
    let focused = false;
    let played = false;
    let generation = 0;

    const reset = () => {
      generation++;
      controls.stop();
      controls.set("normal");
    };
    const disabled = () =>
      Boolean(
        scope.closest(':disabled, [aria-disabled="true"], [data-disabled]') ||
        (scope.hasAttribute("data-icon-input-scope") && scope.querySelector("input:disabled")),
      );
    const play = () => {
      if (!enabled || reducedMotion || disabled() || played) return;
      played = true;
      const currentGeneration = ++generation;
      void controls.start("animate").then(() => {
        if (generation === currentGeneration) controls.set("normal");
      });
    };
    const release = () => {
      if (hovered || focused) return;
      played = false;
      reset();
    };
    const belongsToScope = (target: EventTarget | null) =>
      target instanceof Element && (target.closest(scopeSelector) ?? svg) === scope;
    const pointerEnter = (event: Event) => {
      if (!(event instanceof PointerEvent) || event.pointerType !== "mouse") return;
      hovered = true;
      play();
    };
    const pointerLeave = (event: Event) => {
      if (!(event instanceof PointerEvent) || event.pointerType !== "mouse") return;
      hovered = false;
      release();
    };
    const focusIn = (event: Event) => {
      if (!belongsToScope(event.target)) return;
      focused = event.target instanceof Element && event.target.matches(":focus-visible");
      if (focused) play();
    };
    const focusOut = (event: Event) => {
      if (event instanceof FocusEvent && belongsToScope(event.relatedTarget)) return;
      focused = false;
      release();
    };
    const pointerDown = (event: Event) => {
      if (
        !(event instanceof PointerEvent) ||
        event.pointerType === "mouse" ||
        !belongsToScope(event.target)
      )
        return;
      play();
    };
    const pointerUp = () => {
      if (!hovered && !focused) played = false;
    };
    const pointerCancel = () => {
      played = false;
      reset();
    };

    controls.set("normal");
    const updatePreference = () => {
      reducedMotion = preference.matches;
      played = false;
      reset();
    };
    preference.addEventListener("change", updatePreference);
    const listeners = {
      pointerenter: pointerEnter,
      pointerleave: pointerLeave,
      focusin: focusIn,
      focusout: focusOut,
      pointerdown: pointerDown,
      pointerup: pointerUp,
      pointercancel: pointerCancel,
    };
    for (const [event, listener] of Object.entries(listeners)) {
      scope.addEventListener(event, listener);
    }

    // Base UI 的选项可通过 aria-activedescendant 高亮，不一定获得 DOM 焦点。
    const observer = new MutationObserver(() => {
      if (disabled()) {
        played = false;
        reset();
      } else if (scope.getAttribute("role") === "option") {
        focused = scope.hasAttribute("data-highlighted");
        if (focused) play();
        else release();
      }
    });
    observer.observe(scope, {
      attributes: true,
      subtree: scope.hasAttribute("data-icon-input-scope"),
      attributeFilter: ["disabled", "aria-disabled", "data-disabled", "data-highlighted"],
    });

    return () => {
      observer.disconnect();
      preference.removeEventListener("change", updatePreference);
      for (const [event, listener] of Object.entries(listeners)) {
        scope.removeEventListener(event, listener);
      }
      // Motion 在 layout effect 清理时已卸载控制器，此处只能停止，不能再 set。
      generation++;
      controls.stop();
    };
  }, [controls, enabled]);

  return { controls, ref };
}
