"use client";

import { useState } from "react";

import NiceModal from "@ebay/nice-modal-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

import { authClient } from "@/lib/auth-client";

type ChangePasswordFormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  revokeOtherSessions: boolean;
};

const DEFAULT_FORM_STATE: ChangePasswordFormState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  revokeOtherSessions: true,
};

const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 20;

function validateForm(formData: ChangePasswordFormState) {
  if (!formData.currentPassword) {
    return "请输入当前密码。";
  }

  if (!formData.newPassword) {
    return "请输入新密码。";
  }

  if (formData.newPassword.length < MIN_PASSWORD_LENGTH) {
    return `新密码至少需要 ${MIN_PASSWORD_LENGTH} 位。`;
  }

  if (formData.newPassword.length > MAX_PASSWORD_LENGTH) {
    return `新密码最多 ${MAX_PASSWORD_LENGTH} 位。`;
  }

  if (formData.newPassword !== formData.confirmPassword) {
    return "两次输入的新密码不一致。";
  }

  if (formData.newPassword === formData.currentPassword) {
    return "新密码不能和当前密码相同。";
  }

  return null;
}

export const AdminChangePasswordDialog = NiceModal.create(() => {
  const modal = NiceModal.useModal();
  const [formData, setFormData] =
    useState<ChangePasswordFormState>(DEFAULT_FORM_STATE);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateForm<Key extends keyof ChangePasswordFormState>(
    key: Key,
    value: ChangePasswordFormState[Key],
  ) {
    setFormData((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function submitPasswordChange() {
    const validationError = validateForm(formData);

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const { error } = await authClient.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        revokeOtherSessions: formData.revokeOtherSessions,
      });

      if (error) {
        setFormError(error.message ?? "密码修改失败，请检查当前密码。");
        return;
      }

      toast.success("密码已更新");
      modal.remove();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "密码修改失败，请稍后重试。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={modal.visible}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          modal.remove();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>修改密码</DialogTitle>
          <DialogDescription>
            修改后将使用新密码登录。当前设备的登录状态会保留。
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field data-invalid={!!formError}>
            <FieldLabel htmlFor="current-password">当前密码</FieldLabel>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={formData.currentPassword}
              disabled={isSubmitting}
              aria-invalid={!!formError}
              onChange={(event) =>
                updateForm("currentPassword", event.target.value)
              }
            />
          </Field>
          <Field data-invalid={!!formError}>
            <FieldLabel htmlFor="new-password">新密码</FieldLabel>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={formData.newPassword}
              disabled={isSubmitting}
              aria-invalid={!!formError}
              onChange={(event) =>
                updateForm("newPassword", event.target.value)
              }
            />
            <FieldDescription>
              密码长度需为 {MIN_PASSWORD_LENGTH}-{MAX_PASSWORD_LENGTH} 位。
            </FieldDescription>
          </Field>
          <Field data-invalid={!!formError}>
            <FieldLabel htmlFor="confirm-password">确认新密码</FieldLabel>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={formData.confirmPassword}
              disabled={isSubmitting}
              aria-invalid={!!formError}
              onChange={(event) =>
                updateForm("confirmPassword", event.target.value)
              }
            />
            {formError ? <FieldError>{formError}</FieldError> : null}
          </Field>
          <Field orientation="horizontal">
            <Checkbox
              id="revoke-other-sessions"
              checked={formData.revokeOtherSessions}
              disabled={isSubmitting}
              onCheckedChange={(checked) =>
                updateForm("revokeOtherSessions", checked === true)
              }
            />
            <FieldLabel htmlFor="revoke-other-sessions">
              退出其他设备上的登录状态
            </FieldLabel>
          </Field>
        </FieldGroup>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => modal.remove()}
          >
            取消
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={submitPasswordChange}
          >
            {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
            保存新密码
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
