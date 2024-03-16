import React from 'react';

import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { PATHS } from '@/constants';
import { toSimpleDateString } from '@/lib/utils';

import { type Note } from '../types';

type NoteListItemProps = {
  note: Note;
};

export const NoteListItem = ({ note }: NoteListItemProps) => {
  return (
    <Link
      key={note.id}
      href={`${PATHS.SITE_NOTE}/${note.slug}`}
      className="rounded-2xl border flex items-center h-full p-6 transition-[border] hover:border-primary"
    >
      <div className="grid gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <h3 className="text-2xl font-semibold line-clamp-1">
              {note.title}
            </h3>
          </TooltipTrigger>
          <TooltipContent>{note.title}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {note.description}
            </p>
          </TooltipTrigger>
          <TooltipContent>{note.description}</TooltipContent>
        </Tooltip>
        <div className="text-sm text-muted-foreground">
          {toSimpleDateString(note.createdAt)}
        </div>
        <div className="flex flex-row gap-2">
          {note.tags?.map((tag) => <Badge key={tag.id}>{tag.name}</Badge>)}
        </div>
      </div>
    </Link>
  );
};
