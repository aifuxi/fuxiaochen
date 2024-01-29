'use client';

import React from 'react';

import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

type Props = {
  children?: React.ReactNode;
  session: Session;
};

export const AuthProvider = ({ children, session }: Props) => {
  return <SessionProvider session={session}>{children}</SessionProvider>;
};
