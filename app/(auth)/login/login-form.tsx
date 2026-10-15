"use client";

import type { ComponentProps } from "react";

import { useEffect, useRef, useState } from "react";

import type { LoginFailure } from "@/lib/auth/login-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitLogin } from "@/lib/auth/login-client";
import { authClient, passkeyError, usePasskeySupport } from "@/lib/auth/passkey-client";

export function LoginForm({ invalidCredentials = false }: { invalidCredentials?: boolean }) {
  const [pending, setPending] = useState<"password" | "passkey" | null>(null);
  const passkeySupported = usePasskeySupport();
  const [error, setError] = useState<LoginFailure | null>(
    invalidCredentials
      ? { code: "INVALID_CREDENTIALS", message: "用户名或密码不正确，请重试。" }
      : null,
  );
  const [focusVersion, setFocusVersion] = useState(0);
  const pendingRef = useRef(false);
  const lifecycleRef = useRef({
    mounted: true,
    version: 0,
    controller: null as AbortController | null,
  });
  const formRef = useRef<HTMLFormElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const lifecycle = lifecycleRef.current;
    lifecycle.mounted = true;
    return () => {
      lifecycle.mounted = false;
      lifecycle.version++;
      lifecycle.controller?.abort();
    };
  }, []);

  useEffect(() => {
    if (!error || focusVersion === 0) return;
    const field = error.fieldErrors?.username
      ? "username"
      : error.fieldErrors?.password
        ? "password"
        : null;
    if (field) formRef.current?.querySelector<HTMLInputElement>(`#${field}`)?.focus();
    else errorRef.current?.focus();
  }, [error, focusVersion]);

  const onSubmit: ComponentProps<"form">["onSubmit"] = (event) => {
    event.preventDefault();
    if (pendingRef.current) return;
    const data = new FormData(event.currentTarget);
    const username = data.get("username");
    const password = data.get("password");
    const lifecycle = lifecycleRef.current;
    const requestVersion = ++lifecycle.version;
    const controller = new AbortController();
    lifecycle.controller = controller;
    pendingRef.current = true;
    setPending("password");
    setError(null);
    void submitLogin(
      {
        username: typeof username === "string" ? username : "",
        password: typeof password === "string" ? password : "",
      },
      fetch,
      controller.signal,
    ).then((result) => {
      if (!lifecycle.mounted || lifecycle.version !== requestVersion) return;
      lifecycle.controller = null;
      if (result.success) {
        // 完整导航让新 Cookie 参与后台页面和数据入口的服务端鉴权。
        window.location.replace("/admin/posts");
        return;
      }
      pendingRef.current = false;
      setPending(null);
      setError(result.error);
      setFocusVersion((version) => version + 1);
    });
  };

  const signInWithPasskey = async () => {
    if (pendingRef.current || !passkeySupported) return;
    pendingRef.current = true;
    setPending("passkey");
    setError(null);
    const lifecycle = lifecycleRef.current;
    const version = ++lifecycle.version;
    try {
      const result = await authClient.signIn.passkey();
      if (!lifecycle.mounted || version !== lifecycle.version) return;
      // 接口只确认成功，登录令牌通过 HttpOnly Cookie 写入，不能暴露给客户端。
      if (
        !result.error &&
        result.data &&
        "success" in result.data &&
        result.data.success === true
      ) {
        window.location.replace("/admin/posts");
        return;
      }
      setError({ code: "UNCONFIRMED_RESULT", message: passkeyError(result.error) });
    } catch (failure) {
      if (lifecycle.mounted && version === lifecycle.version)
        setError({ code: "NETWORK_ERROR", message: passkeyError(failure) });
    }
    if (lifecycle.mounted && version === lifecycle.version) {
      pendingRef.current = false;
      setPending(null);
      setFocusVersion((value) => value + 1);
    }
  };

  const usernameError = error?.fieldErrors?.username?.join(" ");
  const passwordError = error?.fieldErrors?.password?.join(" ");
  const credentialsInvalid = error?.code === "INVALID_CREDENTIALS";

  return (
    <form
      ref={formRef}
      action="/api/login"
      method="post"
      className="login-form"
      aria-busy={Boolean(pending)}
      onSubmit={onSubmit}
      onInput={() => {
        if (error) setError(null);
      }}
    >
      <div className="login-field">
        <label htmlFor="username">用户名</label>
        <Input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          maxLength={128}
          readOnly={Boolean(pending)}
          aria-invalid={Boolean(usernameError) || credentialsInvalid}
          aria-describedby={
            usernameError ? "username-error" : credentialsInvalid ? "login-error" : undefined
          }
        />
        {usernameError && (
          <p id="username-error" className="login-field-error">
            {usernameError}
          </p>
        )}
      </div>
      <div className="login-field">
        <label htmlFor="password">密码</label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={128}
          readOnly={Boolean(pending)}
          aria-invalid={Boolean(passwordError) || credentialsInvalid}
          aria-describedby={
            passwordError ? "password-error" : credentialsInvalid ? "login-error" : undefined
          }
        />
        {passwordError && (
          <p id="password-error" className="login-field-error">
            {passwordError}
          </p>
        )}
      </div>
      {error && (
        <p ref={errorRef} id="login-error" className="login-error" role="alert" tabIndex={-1}>
          {error.message}
          {error.retryAfter && <span> 请在约 {error.retryAfter} 秒后重试。</span>}
        </p>
      )}
      <Button
        type="submit"
        variant="primary"
        size="form"
        className="login-submit"
        disabled={Boolean(pending)}
      >
        {pending === "password" ? "登录中…" : "密码登录"}
      </Button>
      <div className="login-passkey">
        <Button
          type="button"
          variant="secondary"
          size="form"
          className="login-submit"
          disabled={Boolean(pending) || !passkeySupported}
          onClick={() => void signInWithPasskey()}
        >
          {pending === "passkey" ? "等待设备验证…" : "使用通行密钥"}
        </Button>
        <p className="login-hint">
          {!passkeySupported
            ? "当前浏览器或连接不支持通行密钥，请使用密码登录。"
            : "首次使用请先用密码登录，再在管理账户中添加通行密钥。"}
        </p>
        <noscript>
          <p className="login-hint">通行密钥需要启用 JavaScript，密码登录仍可使用。</p>
        </noscript>
      </div>
    </form>
  );
}
