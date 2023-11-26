'use client';

import React from 'react';

import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

import { Theme } from '@radix-ui/themes';

type Props = {
  children?: React.ReactNode;
  session: Session;
};

type ThemeProviderProps = React.ComponentProps<typeof Theme>;

export const AuthProvider = ({ children, session }: Props) => {
  return <SessionProvider session={session}>{children}</SessionProvider>;
};

export const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  return <Theme {...props}>{children}</Theme>;
};
