"use client";

import * as React from "react";

import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useToggleNotePublish } from "@/features/note";

type ToggleNotePublishButtonProps = {
  id: string;
  published: boolean;
  refreshAsync: () => Promise<unknown>;
};

export const ToggleNotePublishButton = ({
  id,
  published,
  refreshAsync,
}: ToggleNotePublishButtonProps) => {
  const toggleNotePublishQuery = useToggleNotePublish();

  return (
    <Button size={"icon"} variant="outline" onClick={handleToggleNotePublish}>
      {published ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
    </Button>
  );

  async function handleToggleNotePublish() {
    await toggleNotePublishQuery.runAsync(id);
    await refreshAsync();
  }
};
