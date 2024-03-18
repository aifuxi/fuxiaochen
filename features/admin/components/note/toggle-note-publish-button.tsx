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
  refresh: () => void;
};

export const ToggleNotePublishButton = ({
  id,
  published,
  refresh,
}: ToggleNotePublishButtonProps) => {
  const toggleNotePublishQuery = useToggleNotePublish();

  return (
    <Button size={'icon'} variant="outline" onClick={handleToggleNotePublish}>
      {published ? <IconSolarEyeLinear /> : <IconSolarEyeClosedLinear />}
    </Button>
  );

  function handleToggleNotePublish() {
    toggleNotePublishQuery.run(id);
    refresh();
  }
};
