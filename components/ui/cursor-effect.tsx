"use client";

import { useEffect, useRef } from "react";

const disabledSelector =
  ':disabled, [aria-disabled="true"], [data-disabled]:not([data-disabled="false"])';
const textSelector =
  'textarea, [contenteditable="true"], input:not([type]), input:is([type="text"], [type="search"], [type="email"], [type="url"], [type="tel"], [type="password"], [type="number"])';
const interactiveSelector =
  'a[href], button, select, summary, label, [role="button"], [role="link"], [role="tab"], [role="switch"], [role="checkbox"], [data-cursor-interactive]';
const nativeCursorSelector = '[data-motion="off"], [data-cursor="native"]';

export function CursorEffect() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return undefined;

    const root = document.documentElement;
    let lastTarget: Element | null = null;
    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );

    const hide = () => {
      cursor.dataset.visible = "false";
    };

    const useNativeCursor = () => {
      root.removeAttribute("data-cursor-fx");
      hide();
    };

    const updateAvailability = () => {
      if (finePointer.matches) return;
      useNativeCursor();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") {
        useNativeCursor();
        return;
      }
      if (!finePointer.matches) return;

      const target = event.target;
      if (!(target instanceof Element)) return;
      lastTarget = target;
      if (target.closest(nativeCursorSelector)) {
        useNativeCursor();
        return;
      }

      cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      cursor.dataset.native = target.closest(disabledSelector) ? "true" : "false";
      cursor.dataset.state = target.closest(textSelector)
        ? "text"
        : target.closest(interactiveSelector)
          ? "interactive"
          : "default";
      cursor.dataset.visible = "true";
      root.dataset.cursorFx = "on";
    };

    const onPointerOut = (event: PointerEvent) => {
      if (!event.relatedTarget) hide();
    };

    const onVisibilityChange = () => {
      if (document.hidden) hide();
    };

    const cursorObserver = new MutationObserver(() => {
      if (lastTarget?.closest(nativeCursorSelector)) useNativeCursor();
    });
    cursorObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-motion", "data-cursor"],
      subtree: true,
    });

    finePointer.addEventListener("change", updateAvailability);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerout", onPointerOut);
    window.addEventListener("blur", hide);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      finePointer.removeEventListener("change", updateAvailability);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerout", onPointerOut);
      window.removeEventListener("blur", hide);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      cursorObserver.disconnect();
      root.removeAttribute("data-cursor-fx");
      hide();
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="cursor-fx"
      data-visible="false"
      data-state="default"
      data-native="false"
      aria-hidden="true"
    >
      <svg className="cursor-fx-arrow" viewBox="0 0 24 24" width="22" height="22">
        <path d="M3.5 2.5 18.5 11.5 11.6 12.5 8.8 19.2Z" />
      </svg>
      <i className="cursor-fx-ring" />
      <i className="cursor-fx-text" />
    </div>
  );
}
