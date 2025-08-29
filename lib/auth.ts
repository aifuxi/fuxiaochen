import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";

import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

import { PATHS } from "@/constants";

import { prisma } from "./prisma";

export const { handlers, auth, signOut, signIn } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider,
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (isValid) {
          return user;
        }

        return null;
      },
    }),
  ],
  // 解决这个错误：Error: PrismaClient is not configured to run in Vercel Edge Functions or Edge Middleware.
  // 参考：https://github.com/prisma/prisma/issues/21310#issuecomment-1840428931
  session: { strategy: "jwt" },
  pages: {
    signIn: PATHS.AUTH_SIGN_IN,
  },
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    authorized({ request, auth }) {
      // 将来用作 Next.js middleware，如果是访问后台页面，校验是否登录
      if (request.nextUrl.pathname.startsWith(PATHS.ADMIN_HOME)) {
        return !!auth?.user;
      }

      // 其它路径直接放行
      return true;
    },
  },
});
