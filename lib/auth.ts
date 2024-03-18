import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';

import { PrismaAdapter } from '@auth/prisma-adapter';

import { NODE_ENV } from '@/config';

import { prisma } from './prisma';

export const { handlers, auth, signOut, signIn } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [GithubProvider],
  // 使用next-auth自带的登录界面
  // pages: {
  //   signIn: PATHS.AUTH_SIGNIN,
  // },
  debug: NODE_ENV === 'development',
  callbacks: {
    session: ({ session, token }) => {
      if (session.user && token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
