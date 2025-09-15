"use client";

import * as React from "react";

import { LoaderCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { BytemdViewer } from "@/components/bytemd";

import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from "@/constants";
import { useGetNotes } from "@/features/note";
import { toFromNow, toSlashDateString } from "@/lib/common";

import {
  AdminContentLayout,
  CreateNoteButton,
  DeleteNoteButton,
  NoteListPageHeader,
  ToggleNotePublishButton,
  UpdateNoteButton,
} from "../../components";

export function AdminNoteListPage() {
  const { data, isLoading, mutate } = useGetNotes({
    pageIndex: DEFAULT_PAGE_INDEX,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-72 items-center justify-center">
        <LoaderCircle className="size-9 animate-spin" />
      </div>
    );
  }

  return (
    <AdminContentLayout
      header={
        <NoteListPageHeader extra={<CreateNoteButton onSuccess={mutate} />} />
      }
      className="!max-w-4xl"
    >
      {data?.notes.map((note) => (
        <div key={note.id} className="w-full">
          <div className="relative max-h-[400px] w-full overflow-y-auto rounded-xl border p-6">
            <BytemdViewer body={note.body || ""} />
            <div className="flex flex-wrap justify-end gap-2 py-4">
              {note.tags.map((tag) => (
                <Badge key={tag.id}>{tag.name}</Badge>
              ))}
            </div>
            <div className="flex items-center justify-end text-sm text-muted-foreground">
              <span
                className={`
                  hidden
                  lg:inline-block
                `}
              >
                {toSlashDateString(note.createdAt)}
              </span>
              <span
                className={`
                  mx-2 hidden
                  lg:inline-block
                `}
              >
                ·
              </span>
              <span>{toFromNow(note.createdAt)}</span>
            </div>
            <div className="absolute top-2 right-2 space-x-2">
              <ToggleNotePublishButton
                id={note.id}
                published={note.published}
                onSuccess={mutate}
              />
              <UpdateNoteButton id={note.id} onSuccess={mutate} />
              <DeleteNoteButton id={note.id} onSuccess={mutate} />
            </div>
          </div>
        </div>
      ))}
    </AdminContentLayout>
  );
}
