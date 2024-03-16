import { Badge } from '@/components/ui/badge';

import { BytemdViewer } from '@/components/bytemd';
import { GoBack } from '@/components/go-back';

import { toSimpleDateString } from '@/lib/utils';

import { type Note } from '../types';

type NoteDetailProps = {
  note: Note;
};

export const NoteDetailPage = ({ note }: NoteDetailProps) => {
  return (
    <div className="max-w-6xl mx-auto py-24 grid gap-9">
      <article>
        <h1 className="mb-4 text-4xl font-extrabold ">{note.title}</h1>
        <div className="text-sm flex flex-row items-center text-muted-foreground">
          <span>{toSimpleDateString(note.createdAt)}</span>
        </div>
        <BytemdViewer body={note.body || ''} />
      </article>

      <div className="flex flex-wrap gap-2">
        {note.tags?.map((el) => (
          <Badge key={el.id} className="px-5 py-2 text-base">
            {el.name}
          </Badge>
        ))}
      </div>
      <GoBack />
    </div>
  );
};
