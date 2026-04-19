"use client";

import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";

import { X } from "lucide-react";

type AdminResourceDrawerProps = {
  open: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  onClose?: () => void;
};

type FocusableLike = {
  focus: () => void;
};

type DrawerDocumentLike = {
  activeElement: unknown;
  body: {
    style: {
      overflow: string;
    };
  } | null;
};

type DrawerContainerLike = {
  focus: () => void;
  ownerDocument?: DrawerDocumentLike;
  contains: (target: FocusableLike | null) => boolean;
  querySelectorAll: (selector: string) => ArrayLike<unknown>;
};

function isFocusableLike(value: unknown): value is FocusableLike {
  return (
    typeof value === "object" &&
    value !== null &&
    "focus" in value &&
    typeof value.focus === "function"
  );
}

export function getAdminDrawerFocusableElements(
  container: DrawerContainerLike,
) {
  return Array.from(
    container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter(isFocusableLike);
}

export function handleAdminDrawerKeyDown(
  event: Pick<KeyboardEvent, "key" | "shiftKey" | "target" | "preventDefault">,
  {
    container,
    onClose,
  }: {
    container: DrawerContainerLike;
    onClose?: () => void;
  },
) {
  if (event.key === "Escape") {
    event.preventDefault();
    onClose?.();
    return;
  }

  if (event.key !== "Tab") {
    return;
  }

  const focusableElements = getAdminDrawerFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (!firstElement || !lastElement) {
    event.preventDefault();
    container.focus();
    return;
  }

  const currentTarget = event.target;

  if (
    event.shiftKey &&
    isFocusableLike(currentTarget) &&
    currentTarget === firstElement
  ) {
    event.preventDefault();
    lastElement.focus();
    return;
  }

  if (
    !event.shiftKey &&
    isFocusableLike(currentTarget) &&
    currentTarget === lastElement
  ) {
    event.preventDefault();
    firstElement.focus();
  }
}

export function createAdminDrawerLifecycle({
  container,
}: {
  container: DrawerContainerLike;
}) {
  const ownerDocument = container.ownerDocument;
  const previousActiveElement = ownerDocument?.activeElement ?? null;
  const previousOverflow = ownerDocument?.body?.style.overflow ?? "";
  const focusableElements = getAdminDrawerFocusableElements(container);
  const initialFocusTarget = focusableElements[0] ?? container;

  if (ownerDocument?.body) {
    ownerDocument.body.style.overflow = "hidden";
  }
  initialFocusTarget.focus();

  return () => {
    if (ownerDocument?.body) {
      ownerDocument.body.style.overflow = previousOverflow;
    }

    if (
      previousActiveElement &&
      isFocusableLike(previousActiveElement) &&
      !container.contains(previousActiveElement)
    ) {
      previousActiveElement.focus();
    }
  };
}

function toDrawerContainerLike(container: HTMLDivElement): DrawerContainerLike {
  const ownerDocument = container.ownerDocument;

  return {
    focus: () => {
      container.focus();
    },
    ownerDocument: ownerDocument
      ? {
          activeElement: ownerDocument.activeElement,
          body: ownerDocument.body,
        }
      : undefined,
    contains: (target) => {
      return target instanceof Node ? container.contains(target) : false;
    },
    querySelectorAll: (selector) => {
      return container.querySelectorAll(selector);
    },
  };
}

export function AdminResourceDrawer({
  open,
  title,
  description,
  children,
  footer,
  onClose,
}: AdminResourceDrawerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open || !containerRef.current) {
      return undefined;
    }

    return createAdminDrawerLifecycle({
      container: toDrawerContainerLike(containerRef.current),
    });
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 bg-canvas/72 backdrop-blur-sm">
      <div
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal={true}
        className="ml-auto flex h-full w-full max-w-2xl flex-col border-l border-white/8 bg-surface-1/96 shadow-2xl"
        ref={containerRef}
        role="dialog"
        tabIndex={-1}
        onKeyDown={(event: ReactKeyboardEvent<HTMLDivElement>) => {
          if (!containerRef.current) {
            return;
          }

          handleAdminDrawerKeyDown(event.nativeEvent, {
            container: toDrawerContainerLike(containerRef.current),
            onClose,
          });
        }}
      >
        <header className="flex items-start justify-between gap-4 border-b border-white/8 px-6 py-5">
          <div className="space-y-2">
            <p className="ui-eyebrow">Resource Drawer</p>
            <h2
              className="text-2xl font-medium tracking-[-0.04em] text-text-strong"
              id={titleId}
            >
              {title}
            </h2>
            {description ? (
              <p
                className="max-w-xl text-sm leading-6 text-text-soft"
                id={descriptionId}
              >
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
