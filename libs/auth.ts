import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';

import { PrismaAdapter } from '@auth/prisma-adapter';
import * as bcrypt from 'bcryptjs';

import { type SignInUserReq } from '@/typings/user';

import { PATHS } from '@/constants/path';

import { prisma } from './prisma';

export const { handlers, auth, signOut, signIn } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider,
    Credentials({
      authorize: async (credentials) => {
        const { email, password } = credentials as SignInUserReq;

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findFirst({
          where: {
            email,
          },
        });

        if (!user?.password) return null;

        if (!bcrypt.compareSync(password, user.password)) {
          return null;
        }

        return user;
      },
    }),
  ],
  pages: {
    signIn: PATHS.AUTH_SIGNIN,
  },
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    jwt: ({ token }) => {
      return token;
    },
    session: ({ session, token }) => {
      if (session.user && token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
