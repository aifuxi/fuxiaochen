"use client";

import { useEffect, useRef } from "react";

const disabledSelector = ':disabled, [aria-disabled="true"], [data-disabled]';
const textSelector =
  'textarea, [contenteditable="true"], input:not([type]), input:is([type="text"], [type="search"], [type="email"], [type="url"], [type="tel"], [type="password"], [type="number"])';
const interactiveSelector =
  'a[href], button, select, summary, label, [role="button"], [role="link"], [role="tab"], [role="switch"], [role="checkbox"], [data-cursor-interactive]';

export function CursorEffect({ enabled = true }: { enabled?: boolean }) {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor || !enabled) return undefined;

    const root = document.documentElement;
    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );

    const hide = () => {
      cursor.dataset.visible = "false";
    };

    const updateAvailability = () => {
      if (finePointer.matches) return;
      root.removeAttribute("data-cursor-fx");
      hide();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") {
        root.removeAttribute("data-cursor-fx");
        hide();
        return;
      }
      if (!finePointer.matches) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

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
      root.removeAttribute("data-cursor-fx");
      hide();
    };
  }, [enabled]);

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
