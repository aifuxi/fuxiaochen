import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next';
import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';

import { PrismaAdapter } from '@auth/prisma-adapter';
import { compareSync } from 'bcryptjs';

import { PATHS } from '@/constants/path';

import { env } from './env.mjs';
import { db } from './prisma';

// You'll need to import and pass this
// to `NextAuth` in `app/api/auth/[...nextauth]/route.ts`
export const authConfig = {
  adapter: PrismaAdapter(db),
  secret: env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: 'Credentials',
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        name: {},
        email: {},
        password: {},
      },
      async authorize(credentials) {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (
          !credentials?.email ||
          !credentials?.email ||
          !credentials?.password
        ) {
          return null;
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials?.email,
          },
        });

        if (!user?.password) {
          return null;
        }

        // 检查密码
        const isPasswordValid = compareSync(
          credentials.password,
          user.password,
        );

        if (!isPasswordValid) {
          return null;
        }

        return user;
      },
    }),
    GithubProvider({
      clientId: env.GITHUB_ID,
      clientSecret: env.GITHUB_SECRET,
      httpOptions: {
        timeout: 20 * 1000,
      },
    }),
  ],
  pages: {
    signIn: PATHS.AUTH_SIGNIN,
    newUser: PATHS.AUTH_SIGNUP,
  },
  debug: env.NODE_ENV === 'development',
} satisfies NextAuthOptions;

// Use it in server contexts
export function auth(
  ...args:
    | [GetServerSidePropsContext['req'], GetServerSidePropsContext['res']]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, authConfig);
}
