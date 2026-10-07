"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

type Guard = { dirty: boolean; pending: boolean };
type Entry = { key?: string; index: number; url: string };
const HISTORY_KEY = "fuxiaochenAdminIndex";
const Context = createContext<{
  register: (id: symbol, guard: Guard | null) => void;
  request: (action: () => void) => void;
} | null>(null);

export function NavigationGuardProvider({ children }: { children: ReactNode }) {
  const guards = useRef(new Map<symbol, Guard>());
  const [confirmation, setConfirmation] = useState(false);
  const action = useRef<(() => void) | null>(null);
  const bypass = useRef(false);
  const allowUnload = useRef(false);
  const status = useCallback(
    () => ({
      dirty: [...guards.current.values()].some((g) => g.dirty),
      pending: [...guards.current.values()].some((g) => g.pending),
    }),
    [],
  );
  const register = useCallback((id: symbol, guard: Guard | null) => {
    if (guard) guards.current.set(id, guard);
    else guards.current.delete(id);
  }, []);
  const request = useCallback(
    (work: () => void) => {
      if (status().pending) return;
      if (!status().dirty || bypass.current) work();
      else {
        action.current = work;
        setConfirmation(true);
      }
    },
    [status],
  );

  useEffect(() => {
    const nav = window.navigation;
    let sequence = Number(history.state?.[HISTORY_KEY]) || 0;
    const push = history.pushState.bind(history);
    const replace = history.replaceState.bind(history);
    const read = (): Entry => ({
      key: nav?.currentEntry?.key,
      index: nav?.currentEntry?.index ?? Number(history.state?.[HISTORY_KEY]),
      url: location.href,
    });
    replace({ ...history.state, [HISTORY_KEY]: sequence }, "");
    let origin = read();
    let restoring = false;
    let approved: Entry | null = null;
    const wrappedPush: History["pushState"] = (data, unused, url) => {
      push({ ...data, [HISTORY_KEY]: ++sequence }, unused, url);
      origin = read();
      allowUnload.current = false;
    };
    const wrappedReplace: History["replaceState"] = (data, unused, url) => {
      replace({ ...data, [HISTORY_KEY]: Number(history.state?.[HISTORY_KEY]) || 0 }, unused, url);
      if (!restoring) origin = read();
    };
    history.pushState = wrappedPush;
    history.replaceState = wrappedReplace;
    const same = (a: Entry, b: Entry) => (a.key && b.key ? a.key === b.key : a.index === b.index);
    const travel = (entry: Entry) => {
      if (nav && entry.key)
        void nav.traverseTo(entry.key).finished?.catch(() => {
          /* 连续历史操作可能取消上一次恢复；由后续 popstate 重新定位。 */
        });
      else history.go(entry.index - read().index);
    };
    const pop = (event: PopStateEvent) => {
      const target = read();
      if (approved && same(target, approved)) {
        approved = null;
        origin = target;
        allowUnload.current = false;
        return;
      }
      if (restoring && same(target, origin)) {
        event.stopImmediatePropagation();
        restoring = false;
        setConfirmation(Boolean(action.current));
        return;
      }
      if (!status().dirty && !status().pending) {
        origin = target;
        allowUnload.current = false;
        return;
      }
      // 在 Next.js 收到事件前恢复历史，避免编辑器卸载后再尝试找回草稿。
      event.stopImmediatePropagation();
      if (!Number.isFinite(target.index) || same(target, origin)) return;
      action.current = status().pending
        ? null
        : () => {
            approved = target;
            travel(target);
          };
      restoring = true;
      travel(origin);
    };
    const unload = (event: BeforeUnloadEvent) => {
      if (allowUnload.current) {
        allowUnload.current = false;
        return;
      }
      if (!bypass.current && (status().dirty || status().pending)) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    const click = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        bypass.current
      )
        return;
      const link =
        event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (
        !link ||
        (link.target && link.target !== "_self") ||
        link.hasAttribute("download") ||
        link.href === location.href
      )
        return;
      if (!status().dirty && !status().pending) return;
      event.preventDefault();
      event.stopPropagation();
      request(() => {
        bypass.current = true;
        try {
          link.click();
        } finally {
          bypass.current = false;
        }
      });
    };
    const submit = (event: SubmitEvent) => {
      const form = event.target;
      if (
        !(form instanceof HTMLFormElement) ||
        !form.action.includes("/api/logout") ||
        bypass.current
      )
        return;
      if (!status().dirty && !status().pending) return;
      event.preventDefault();
      event.stopPropagation();
      request(() => {
        bypass.current = true;
        form.submit();
      });
    };
    window.addEventListener("popstate", pop, true);
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", click, true);
    document.addEventListener("submit", submit, true);
    return () => {
      window.removeEventListener("popstate", pop, true);
      window.removeEventListener("beforeunload", unload);
      document.removeEventListener("click", click, true);
      document.removeEventListener("submit", submit, true);
      if (history.pushState === wrappedPush) history.pushState = push;
      if (history.replaceState === wrappedReplace) history.replaceState = replace;
    };
  }, [request, status]);

  return (
    <Context.Provider value={{ register, request }}>
      {children}
      <Dialog
        open={confirmation}
        onOpenChange={(open) => {
          setConfirmation(open);
          if (!open) action.current = null;
        }}
      >
        <DialogContent>
          <DialogTitle>有未保存的修改</DialogTitle>
          <DialogDescription>离开后将丢弃本次修改。你可以继续编辑并手动保存。</DialogDescription>
          <div className="admin-modal-actions">
            <Button
              onClick={() => {
                action.current = null;
                setConfirmation(false);
              }}
            >
              继续编辑
            </Button>
            <Button
              className="admin-danger"
              onClick={() => {
                if (status().pending) return;
                const work = action.current;
                action.current = null;
                setConfirmation(false);
                allowUnload.current = true;
                work?.();
              }}
            >
              放弃修改并离开
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Context.Provider>
  );
}

export function useNavigationGuard(dirty = false, pending = false) {
  const context = useContext(Context);
  if (!context) throw new Error("编辑保护必须位于后台导航提供器内");
  const { register, request } = context;
  const id = useRef(Symbol("admin-form"));
  useLayoutEffect(() => {
    register(id.current, { dirty, pending });
  });
  useLayoutEffect(() => {
    const key = id.current;
    return () => register(key, null);
  }, [register]);
  return request;
}
