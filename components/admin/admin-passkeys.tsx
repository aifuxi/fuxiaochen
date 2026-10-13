"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient, passkeyError, usePasskeySupport } from "@/lib/auth/passkey-client";

type StoredPasskey = { id: string; name?: string | null; createdAt?: Date | string | null };

export function AdminPasskeys({
  busy,
  runOperation,
}: {
  busy: boolean;
  runOperation: <T>(work: () => Promise<T>) => Promise<T>;
}) {
  const [keys, setKeys] = useState<StoredPasskey[] | null>(null);
  const [loading, setLoading] = useState(true);
  const supported = usePasskeySupport();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [action, setAction] = useState<string | null>(null);
  const lifecycle = useRef({ mounted: false, version: 0 });
  const deleteTrigger = useRef<HTMLButtonElement | null>(null);
  const status = useRef<HTMLOutputElement>(null);

  const load = useCallback(() => {
    const version = ++lifecycle.current.version;
    return authClient.passkey
      .listUserPasskeys()
      .then((result) => {
        if (result.error || !Array.isArray(result.data)) throw result.error;
        if (lifecycle.current.mounted && version === lifecycle.current.version)
          setKeys(result.data);
        return true;
      })
      .catch((failure: unknown) => {
        if (lifecycle.current.mounted && version === lifecycle.current.version)
          setError(passkeyError(failure));
        return false;
      })
      .finally(() => {
        if (lifecycle.current.mounted && version === lifecycle.current.version) setLoading(false);
      });
  }, []);

  useEffect(() => {
    const current = lifecycle.current;
    current.mounted = true;
    void load();
    return () => {
      current.mounted = false;
      current.version++;
    };
  }, [load]);

  const mutate = async (kind: string, work: () => Promise<void>) => {
    setError("");
    setMessage("");
    setAction(kind);
    try {
      await runOperation(work);
    } catch (failure) {
      if (lifecycle.current.mounted) setError(passkeyError(failure));
    } finally {
      if (lifecycle.current.mounted) {
        setAction(null);
        // 操作结束后把结果交给键盘及读屏用户，避免焦点遗留在已删除的按钮上。
        requestAnimationFrame(() => status.current?.focus());
      }
    }
  };

  const add = () =>
    mutate("add", async () => {
      const result = await authClient.passkey.addPasskey({ name: name.trim() || undefined });
      if (result.error || !result.data?.id) throw result.error;
      if (!lifecycle.current.mounted) return;
      setName("");
      setLoading(true);
      const refreshed = await load();
      if (lifecycle.current.mounted)
        setMessage(
          refreshed
            ? "通行密钥已添加，下次可以直接使用它登录。"
            : "通行密钥已添加，但列表刷新失败，请重新加载列表。",
        );
    });

  const remove = (key: StoredPasskey) =>
    mutate(key.id, async () => {
      const result = await authClient.passkey.deletePasskey({ id: key.id });
      if (result.error || !result.data?.status) throw result.error;
      if (!lifecycle.current.mounted) return;
      setDeleting(null);
      setKeys((current) => current?.filter((item) => item.id !== key.id) ?? null);
      setLoading(true);
      const refreshed = await load();
      if (lifecycle.current.mounted)
        setMessage(
          refreshed
            ? "通行密钥已删除，仍可使用密码或其他通行密钥登录。"
            : "通行密钥已删除，但列表刷新失败，请重新加载列表。",
        );
    });

  return (
    <section className="admin-passkeys" aria-labelledby="passkeys-title" aria-busy={busy}>
      <div>
        <h3 id="passkeys-title">通行密钥</h3>
        <p className="admin-passkeys-hint">
          使用设备的指纹、面容或锁屏验证登录。密码登录始终保留。
        </p>
      </div>
      {loading && <output className="admin-passkeys-hint">正在加载通行密钥…</output>}
      {!loading && keys?.length === 0 && (
        <p className="admin-passkeys-hint">还没有通行密钥，添加后即可在登录页使用。</p>
      )}
      {keys && keys.length > 0 && (
        <ul className="admin-passkeys-list">
          {keys.map((key) => (
            <li key={key.id}>
              <div className="admin-passkeys-row">
                <div>
                  <strong>{key.name || "未命名通行密钥"}</strong>
                  <p className="admin-passkeys-hint">
                    {key.createdAt
                      ? `添加于 ${new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", dateStyle: "medium" }).format(new Date(key.createdAt))}`
                      : "已添加"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={busy || loading}
                  aria-label={`删除${key.name || "未命名通行密钥"}`}
                  onClick={(event) => {
                    deleteTrigger.current = event.currentTarget;
                    setDeleting(key.id);
                    setError("");
                    setMessage("");
                  }}
                >
                  删除
                </Button>
              </div>
              {deleting === key.id && (
                <div className="admin-passkeys-confirm">
                  <p>删除后，这枚通行密钥将无法登录。密码和其他通行密钥仍可使用。</p>
                  <div className="admin-passkeys-actions">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={busy}
                      onClick={() => {
                        setDeleting(null);
                        deleteTrigger.current?.focus();
                      }}
                    >
                      取消
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      disabled={busy || loading}
                      onClick={() => void remove(key)}
                    >
                      {action === key.id ? "删除中…" : "确认删除"}
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {error && (
        <div>
          <p className="admin-passkeys-error" role="alert">
            {error}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy || loading}
            onClick={() => {
              setError("");
              setLoading(true);
              void load();
            }}
          >
            重新加载列表
          </Button>
        </div>
      )}
      <div className="admin-passkeys-add">
        <label htmlFor="passkey-name">名称（选填）</label>
        <Input
          id="passkey-name"
          value={name}
          maxLength={64}
          placeholder="例如：我的手机"
          disabled={busy || !supported}
          onChange={(event) => setName(event.target.value)}
        />
        <Button
          type="button"
          variant="secondary"
          disabled={busy || loading || !supported}
          onClick={() => void add()}
        >
          {action === "add" ? "等待设备验证…" : "添加通行密钥"}
        </Button>
        {!supported && (
          <p className="admin-passkeys-hint">
            当前浏览器或连接不支持添加通行密钥，可以使用其他支持的设备登录后添加。
          </p>
        )}
      </div>
      <output ref={status} tabIndex={-1} className="admin-passkeys-result">
        {message || (action ? "请在设备提示中完成验证。" : error)}
      </output>
    </section>
  );
}
