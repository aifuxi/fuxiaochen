import type { Session } from 'next-auth';

export const checkPermission = (session: Session | null): boolean => {
  const whitelistEmails = process.env.WHITELIST_EMAILS?.split(',') || [];
  return whitelistEmails.includes(session?.user?.email || '');
};
