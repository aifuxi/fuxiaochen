"use client";

import * as React from "react";

import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useToggleNotePublish } from "@/features/note";

interface ToggleNotePublishButtonProps {
  id: string;
  published: boolean;
  onSuccess?: () => void;
}

export const ToggleNotePublishButton = ({
  id,
  published,
  onSuccess,
}: ToggleNotePublishButtonProps) => {
  const mutation = useToggleNotePublish(id);

  return (
    <Button size={"icon"} variant="outline" onClick={handleCheckedChange}>
      {published ? <Eye /> : <EyeOff />}
    </Button>
  );

  async function handleCheckedChange() {
    mutation.trigger();
    onSuccess?.();
  }
};
