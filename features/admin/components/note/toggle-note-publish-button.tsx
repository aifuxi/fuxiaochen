'use client';

import React from 'react';

import { Button } from '@/components/ui/button';

import {
  IconSolarEyeClosedLinear,
  IconSolarEyeLinear,
} from '@/components/icons';

import { useToggleNotePublish } from '@/features/note';

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
    <Button size={'icon'} variant="outline" onClick={handleToggleNotePublish}>
      {published ? <IconSolarEyeLinear /> : <IconSolarEyeClosedLinear />}
    </Button>
  );

  async function handleToggleNotePublish() {
    await toggleNotePublishQuery.runAsync(id);
    await refreshAsync();
  }
};
