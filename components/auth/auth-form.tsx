"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Github } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

import { authClient } from "@/lib/auth-client";

import { routes } from "@/constants/routes";

type AuthFormProps = {
  githubEnabled: boolean;
  mode: "login" | "register";
  redirectTo: string;
};

const FORM_COPY = {
  login: {
    title: "欢迎回来",
    description: "使用邮箱密码或 GitHub 登录后台。",
    submitLabel: "登录",
    alternateHrefLabel: "创建账号",
    alternateHref: routes.auth.register,
    alternateHint: "还没有账号？",
  },
  register: {
    title: "创建账号",
    description: "注册后会自动登录，并跳转到后台。",
    submitLabel: "注册",
    alternateHrefLabel: "去登录",
    alternateHref: routes.auth.login,
    alternateHint: "已经有账号？",
  },
} as const;

const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 20;

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "请输入邮箱地址。")
  .email("请输入有效的邮箱地址。");

const passwordSchema = z
  .string()
  .min(1, "请输入密码。")
  .min(MIN_PASSWORD_LENGTH, `密码至少需要 ${MIN_PASSWORD_LENGTH} 位。`)
  .max(MAX_PASSWORD_LENGTH, `密码最多 ${MAX_PASSWORD_LENGTH} 位。`);

const loginFormSchema = z.object({
  email: emailSchema,
  name: z.string().trim().optional().default(""),
  password: passwordSchema,
});

const registerFormSchema = loginFormSchema.extend({
  name: z.string().trim().min(1, "请输入昵称。"),
});

type AuthFormInput =
  | z.input<typeof loginFormSchema>
  | z.input<typeof registerFormSchema>;
type AuthFormValues = z.output<typeof registerFormSchema>;

export function AuthForm({ githubEnabled, mode, redirectTo }: AuthFormProps) {
  const copy = FORM_COPY[mode];
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [website, setWebsite] = useState("");
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const resetSubmissionClock = () => setStartedAt(Date.now());
  const form = useForm<AuthFormInput, unknown, AuthFormValues>({
    defaultValues: {
      email: "",
      name: "",
      password: "",
    },
    resolver: zodResolver(
      mode === "register" ? registerFormSchema : loginFormSchema,
    ),
  });

  const isSubmitting = isEmailLoading || isGithubLoading;
  const fieldError = (name: keyof AuthFormValues) => {
    const error = form.formState.errors[name];
    return error ? [{ message: error.message }] : undefined;
  };

  const handleSubmit = form.handleSubmit(async ({ email, name, password }) => {
    setError(null);
    setIsEmailLoading(true);

    try {
      if (mode === "register") {
        const signUpPayload = {
          email,
          password,
          name,
          website,
          startedAt,
        } as Parameters<typeof authClient.signUp.email>[0] & {
          startedAt: number;
          website: string;
        };
        const { error: signUpError } =
          await authClient.signUp.email(signUpPayload);

        if (signUpError) {
          setError(signUpError.message ?? "注册失败，请稍后再试。");
          resetSubmissionClock();
          return;
        }
      } else {
        const { error: signInError } = await authClient.signIn.email({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message ?? "登录失败，请检查邮箱和密码。");
          return;
        }
      }

      router.replace(redirectTo);
      router.refresh();
    } finally {
      setIsEmailLoading(false);
      if (mode === "register") {
        setWebsite("");
      }
    }
  });

  async function handleGithubSignIn() {
    setError(null);
    setIsGithubLoading(true);

    try {
      const { error: socialError } = await authClient.signIn.social({
        provider: "github",
        callbackURL: redirectTo,
      });

      if (socialError) {
        setError(socialError.message ?? "GitHub 登录失败，请稍后再试。");
      }
    } finally {
      setIsGithubLoading(false);
    }
  }

  const alternateHref =
    redirectTo === routes.admin.root
      ? copy.alternateHref
      : `${copy.alternateHref}?next=${encodeURIComponent(redirectTo)}`;

  return (
    <Card className="border-border/70 bg-background/95 shadow-xl backdrop-blur">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">{copy.title}</CardTitle>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form
          noValidate
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <FieldGroup className="gap-4">
            {mode === "register" && (
              <Field data-invalid={!!form.formState.errors.name}>
                <FieldLabel htmlFor="name">昵称</FieldLabel>
                <Input
                  id="name"
                  placeholder="Fuxiaochen"
                  autoComplete="nickname"
                  disabled={isSubmitting}
                  aria-invalid={!!form.formState.errors.name}
                  {...form.register("name")}
                  required
                />
                <FieldError errors={fieldError("name")} />
              </Field>
            )}

            {mode === "register" && (
              <div className="hidden" aria-hidden="true">
                <label htmlFor="register-website">Website</label>
                <input
                  id="register-website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                />
              </div>
            )}

            <Field data-invalid={!!form.formState.errors.email}>
              <FieldLabel htmlFor="email">邮箱</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                disabled={isSubmitting}
                aria-invalid={!!form.formState.errors.email}
                {...form.register("email")}
                required
              />
              <FieldError errors={fieldError("email")} />
            </Field>

            <Field data-invalid={!!form.formState.errors.password}>
              <FieldLabel htmlFor="password">密码</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder={`${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH} 位`}
                autoComplete={
                  mode === "register" ? "new-password" : "current-password"
                }
                disabled={isSubmitting}
                aria-invalid={!!form.formState.errors.password}
                maxLength={MAX_PASSWORD_LENGTH}
                minLength={MIN_PASSWORD_LENGTH}
                {...form.register("password")}
                required
              />
              <FieldError errors={fieldError("password")} />
            </Field>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
          </FieldGroup>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isEmailLoading ? <Spinner data-icon="inline-start" /> : null}
            {copy.submitLabel}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              或者
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGithubSignIn}
          disabled={!githubEnabled || isSubmitting}
        >
          {isGithubLoading ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <Github data-icon="inline-start" />
          )}
          使用 GitHub 继续
        </Button>

        {!githubEnabled && (
          <p className="text-xs text-muted-foreground">
            当前环境未配置 `GITHUB_CLIENT_ID` 或 `GITHUB_CLIENT_SECRET`。
          </p>
        )}

        <p className="text-center text-sm text-muted-foreground">
          {copy.alternateHint}{" "}
          <Link href={alternateHref} className="font-medium text-foreground">
            {copy.alternateHrefLabel}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
