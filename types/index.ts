import { type Session } from 'next-auth';

export type SortOrder = 'asc' | 'desc';

export type WithSession = { session: Session | null };
