"use client";

import NiceModal, { type NiceModalHocProps } from "@ebay/nice-modal-react";
import { FriendLinkStatus } from "@/generated/prisma/enums";
import React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createFriendLinkBodySchema,
  type CreateFriendLinkInput,
  type FriendLinkDto,
} from "@/lib/friend-link/friend-link-dto";

type FriendLinkFormDialogProps = NiceModalHocProps & {
  friendLink?: FriendLinkDto;
  mode: "create" | "edit";
  onSubmit: (input: CreateFriendLinkInput) => Promise<void>;
};

const STATUS_OPTIONS = [
  { label: "Approved", value: FriendLinkStatus.Approved },
  { label: "Pending", value: FriendLinkStatus.Pending },
  { label: "Offline", value: FriendLinkStatus.Offline },
  { label: "Rejected", value: FriendLinkStatus.Rejected },
];

export const FriendLinkFormDialog = NiceModal.create(
  ({ friendLink, mode, onSubmit }: FriendLinkFormDialogProps) => {
    const modal = NiceModal.useModal();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [values, setValues] = React.useState(() => ({
      avatarAssetId: friendLink?.avatarAssetId ?? "",
      description: friendLink?.description ?? "",
      domain: friendLink?.domain ?? "",
      siteName: friendLink?.siteName ?? "",
      siteUrl: friendLink?.siteUrl ?? "",
      sortOrder: String(friendLink?.sortOrder ?? 0),
      status: friendLink?.status ?? FriendLinkStatus.Approved,
      subtitle: friendLink?.subtitle ?? "",
    }));
    const [hasEditedDomain, setHasEditedDomain] = React.useState(mode === "edit");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();

      const parsedValues = createFriendLinkBodySchema.safeParse({
        ...values,
        avatarAssetId: values.avatarAssetId || null,
        domain: values.domain || null,
        subtitle: values.subtitle || null,
      });

      if (!parsedValues.success) {
        toast.error(parsedValues.error.issues[0]?.message ?? "Please check your input.");

        return;
      }

      setIsSubmitting(true);

      try {
        await onSubmit({
          ...parsedValues.data,
          avatarAssetId: parsedValues.data.avatarAssetId || null,
          domain: parsedValues.data.domain || null,
          subtitle: parsedValues.data.subtitle || null,
        });
        modal.remove();
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Failed to save friend link.");
        }
      } finally {
        setIsSubmitting(false);
      }
    }

    function handleSiteUrlChange(event: React.ChangeEvent<HTMLInputElement>) {
      const nextSiteUrl = event.target.value;

      setValues((currentValues) => {
        if (mode === "create" && !hasEditedDomain) {
          return {
            ...currentValues,
            domain: extractDomain(nextSiteUrl),
            siteUrl: nextSiteUrl,
          };
        }

        return {
          ...currentValues,
          siteUrl: nextSiteUrl,
        };
      });
    }

    return (
      <Dialog open={modal.visible} onOpenChange={modal.remove}>
        <DialogContent className={`
          max-w-3xl rounded-[1.6rem] p-6
          sm:p-8
        `}>
          <DialogHeader>
            <DialogTitle className="text-3xl">{mode === "create" ? "Add Friend Link" : "Edit Friend Link"}</DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Add a new external site to the friends directory."
                : "Update friend link details without leaving the current listing."}
            </DialogDescription>
          </DialogHeader>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className={`
              grid gap-5
              sm:grid-cols-2
            `}>
              <Field label="Site Name">
                <Input
                  autoFocus
                  disabled={isSubmitting}
                  onChange={(event) =>
                    setValues((currentValues) => ({
                      ...currentValues,
                      siteName: event.target.value,
                    }))
                  }
                  placeholder="Lin Studio"
                  value={values.siteName}
                />
              </Field>
              <Field label="Site URL">
                <Input
                  disabled={isSubmitting}
                  onChange={handleSiteUrlChange}
                  placeholder="https://example.com"
                  value={values.siteUrl}
                />
              </Field>
            </div>

            <div className={`
              grid gap-5
              sm:grid-cols-2
            `}>
              <Field label="Status">
                <Select
                  disabled={isSubmitting}
                  onValueChange={(value) =>
                    setValues((currentValues) => ({
                      ...currentValues,
                      status: value as FriendLinkStatus,
                    }))
                  }
                  options={STATUS_OPTIONS}
                  value={values.status}
                />
              </Field>
              <Field description="Lower values appear first in sorted lists." label="Sort Order">
                <Input
                  disabled={isSubmitting}
                  inputMode="numeric"
                  onChange={(event) =>
                    setValues((currentValues) => ({
                      ...currentValues,
                      sortOrder: event.target.value,
                    }))
                  }
                  placeholder="0"
                  type="number"
                  value={values.sortOrder}
                />
              </Field>
            </div>

            <div className={`
              grid gap-5
              sm:grid-cols-2
            `}>
              <Field description="Optional short label shown under the site name." label="Subtitle">
                <Input
                  disabled={isSubmitting}
                  onChange={(event) =>
                    setValues((currentValues) => ({
                      ...currentValues,
                      subtitle: event.target.value,
                    }))
                  }
                  placeholder="Builder notes"
                  value={values.subtitle}
                />
              </Field>
              <Field description="Optional host label for cards and filtering." label="Domain">
                <Input
                  disabled={isSubmitting}
                  onChange={(event) => {
                    setHasEditedDomain(true);
                    setValues((currentValues) => ({
                      ...currentValues,
                      domain: event.target.value,
                    }));
                  }}
                  placeholder="example.com"
                  value={values.domain}
                />
              </Field>
            </div>

            <Field description="Optional media asset id for the avatar image." label="Avatar Asset ID">
              <Input
                disabled={isSubmitting}
                onChange={(event) =>
                  setValues((currentValues) => ({
                    ...currentValues,
                    avatarAssetId: event.target.value,
                  }))
                }
                placeholder="cm..."
                value={values.avatarAssetId}
              />
            </Field>

            <Field label="Description">
              <Textarea
                disabled={isSubmitting}
                onChange={(event) =>
                  setValues((currentValues) => ({
                    ...currentValues,
                    description: event.target.value,
                  }))
                }
                placeholder="A builder documenting systems thinking, product craft, and independent work."
                value={values.description}
              />
            </Field>

            <div className="flex justify-end gap-3">
              <Button disabled={isSubmitting} onClick={() => modal.remove()} type="button" variant="outline">
                Cancel
              </Button>
              <Button disabled={isSubmitting} type="submit" variant="primary">
                {isSubmitting
                  ? mode === "create"
                    ? "Saving..."
                    : "Updating..."
                  : mode === "create"
                    ? "Create Friend Link"
                    : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
);

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
      {description ? <span className="block text-xs text-muted">{description}</span> : null}
    </label>
  );
}

function extractDomain(value: string) {
  if (!URL.canParse(value)) {
    return "";
  }

  return new URL(value).host;
}
