"use client";

import type { ReactNode } from "react";

import { X } from "lucide-react";

type AdminResourceDrawerProps = {
  open: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  onClose?: () => void;
};

export function AdminResourceDrawer({
  open,
  title,
  description,
  children,
  footer,
  onClose,
}: AdminResourceDrawerProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 bg-canvas/72 backdrop-blur-sm">
      <div className="ml-auto flex h-full w-full max-w-2xl flex-col border-l border-white/8 bg-surface-1/96 shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-white/8 px-6 py-5">
          <div className="space-y-2">
            <p className="ui-eyebrow">Resource Drawer</p>
            <h2 className="text-2xl font-medium tracking-[-0.04em] text-text-strong">
              {title}
            </h2>
            {description ? (
              <p className="max-w-xl text-sm leading-6 text-text-soft">
                {description}
              </p>
            ) : null}
          </div>

          {onClose ? (
            <button className="ui-admin-button" type="button" onClick={onClose}>
              <X className="size-3.5" />
              Close
            </button>
          ) : null}
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>

        {footer ? (
          <footer className="border-t border-white/8 bg-surface-2/50 px-6 py-4">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
}
