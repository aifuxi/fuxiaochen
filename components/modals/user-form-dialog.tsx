"use client";

import React from "react";
import NiceModal, { type NiceModalHocProps } from "@ebay/nice-modal-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  createUserBodySchema,
  updateUserBodySchema,
  type CreateUserInput,
  type UpdateUserInput,
  type UserDto,
} from "@/lib/user/user-dto";
import { userRoleOptions } from "@/lib/user/user-role";

type UserFormDialogProps = NiceModalHocProps &
  (
    | {
        mode: "create";
        onSubmit: (input: CreateUserInput) => Promise<void>;
        user?: undefined;
      }
    | {
        mode: "edit";
        onSubmit: (input: UpdateUserInput) => Promise<void>;
        user: UserDto;
      }
  );

export const UserFormDialog = NiceModal.create((props: UserFormDialogProps) => {
  const modal = NiceModal.useModal();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [values, setValues] = React.useState(() => ({
    email: props.user?.email ?? "",
    emailVerified: props.user?.emailVerified ?? false,
    image: props.user?.image ?? "",
    name: props.user?.name ?? "",
    password: "",
    role: props.user?.role ?? "Normal",
  }));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (props.mode === "create") {
      const parsedValues = createUserBodySchema.safeParse(values);

      if (!parsedValues.success) {
        toast.error(
          parsedValues.error.issues[0]?.message ?? "请检查输入内容。",
        );

        return;
      }

      setIsSubmitting(true);

      try {
        await props.onSubmit({
          ...parsedValues.data,
          image: parsedValues.data.image || null,
        });
        modal.remove();
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("保存用户失败。");
        }
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    const parsedValues = updateUserBodySchema.safeParse({
      email: values.email,
      emailVerified: values.emailVerified,
      image: values.image,
      name: values.name,
      password: values.password.trim() ? values.password : undefined,
      role: values.role,
    });

    if (!parsedValues.success) {
      toast.error(
        parsedValues.error.issues[0]?.message ?? "请检查输入内容。",
      );

      return;
    }

    setIsSubmitting(true);

    try {
      await props.onSubmit({
        ...parsedValues.data,
        image: parsedValues.data.image || null,
      });
      modal.remove();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("保存用户失败。");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={modal.visible} onOpenChange={modal.remove}>
      <DialogContent
        className={`
          max-w-3xl rounded-4xl p-6
          sm:p-8
        `}
      >
        <DialogHeader>
          <DialogTitle className="text-3xl">
            {props.mode === "create" ? "添加用户" : "编辑用户"}
          </DialogTitle>
          <DialogDescription>
            {props.mode === "create"
              ? "创建使用邮箱/密码访问的 CMS 用户账号。"
              : "更新资料字段、验证状态，或在此处重置密码。"}
          </DialogDescription>
        </DialogHeader>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div
            className={`
              grid gap-5
              sm:grid-cols-2
            `}
          >
            <Field label="名称">
              <Input
                autoFocus
                disabled={isSubmitting}
                onChange={(event) =>
                  setValues((currentValues) => ({
                    ...currentValues,
                    name: event.target.value,
                  }))
                }
                placeholder="Sarah Chen"
                value={values.name}
              />
            </Field>
            <Field label="邮箱">
              <Input
                disabled={isSubmitting}
                onChange={(event) =>
                  setValues((currentValues) => ({
                    ...currentValues,
                    email: event.target.value,
                  }))
                }
                placeholder="sarah@example.com"
                type="email"
                value={values.email}
              />
            </Field>
          </div>

          <Field
            description="管理员可以访问用户管理 API 和页面。"
            label="角色"
          >
            <Select
              onValueChange={(value) =>
                setValues((currentValues) => ({
                  ...currentValues,
                  role: value as "Admin" | "Normal",
                }))
              }
              options={userRoleOptions}
              value={values.role}
            />
          </Field>

          <div
            className={`
              grid gap-5
              sm:grid-cols-2
            `}
          >
            <Field
              description={
                props.mode === "create"
                  ? "最少 8 个字符。"
                  : "留空以保持当前密码不变。"
              }
              label={props.mode === "create" ? "密码" : "新密码"}
            >
              <Input
                disabled={isSubmitting}
                onChange={(event) =>
                  setValues((currentValues) => ({
                    ...currentValues,
                    password: event.target.value,
                  }))
                }
                placeholder={
                  props.mode === "create"
                    ? "test123456"
                    : "输入新密码"
                }
                type="password"
                value={values.password}
              />
            </Field>
            <Field
              description="可选的头像或资料图片 URL。"
              label="图片 URL"
            >
              <Input
                disabled={isSubmitting}
                onChange={(event) =>
                  setValues((currentValues) => ({
                    ...currentValues,
                    image: event.target.value,
                  }))
                }
                placeholder="https://example.com/avatar.jpg"
                value={values.image}
              />
            </Field>
          </div>

          <label
            className={`
              flex items-center gap-3 rounded-2xl border border-white/8 bg-white/3 p-4 text-sm text-foreground
            `}
          >
            <Checkbox
              checked={values.emailVerified}
              onCheckedChange={(checked) =>
                setValues((currentValues) => ({
                  ...currentValues,
                  emailVerified: Boolean(checked),
                }))
              }
            />
            <div className="space-y-1">
              <span className="block font-medium text-foreground">
                邮箱已验证
              </span>
              <span className="block text-xs text-muted">
                将此账号标记为已验证状态。
              </span>
            </div>
          </label>

          <div className="flex justify-end gap-3">
            <Button
              disabled={isSubmitting}
              onClick={() => modal.remove()}
              type="button"
              variant="outline"
            >
              取消
            </Button>
            <Button disabled={isSubmitting} type="submit" variant="primary">
              {isSubmitting
                ? props.mode === "create"
                  ? "创建中..."
                  : "保存中..."
                : props.mode === "create"
                  ? "创建用户"
                  : "保存更改"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});

function Field({
  children,
  description,
  label,
}: {
  children: React.ReactNode;
  description?: string;
  label: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="type-label text-foreground">{label}</span>
      {children}
      {description ? (
        <span className="block text-xs text-muted">{description}</span>
      ) : null}
    </label>
  );
}
