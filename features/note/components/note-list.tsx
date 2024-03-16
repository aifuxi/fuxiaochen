import { IllustrationNoContent } from '@/components/illustrations';

import { NoteListItem } from './note-list-item';

import { type Note } from '../types';

type NoteListProps = {
  notes: Note[];
};

export const NoteList = ({ notes }: NoteListProps) => {
  if (!notes.length) {
    return (
      <div className="grid gap-8 place-content-center">
        <IllustrationNoContent className="w-[30vh] h-[30vh]" />
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight text-center">
          暂无 Note
        </h3>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
      {notes.map((el) => (
        <li key={el.id}>
          <NoteListItem note={el} />
        </li>
      ))}
    </ul>
  );
};
