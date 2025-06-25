import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { PrismaAdapter } from "@auth/prisma-adapter";

import { INTERNAL_PATHS } from "@/constants/path";

import { prisma } from "./prisma";

export const { handlers, auth, signOut, signIn } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        nickname: { label: "昵称", type: "text" },
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
    }),
  ],
  pages: {
    signIn: INTERNAL_PATHS.LOGIN,
  },
  debug: process.env.NODE_ENV === "development",
  session: { strategy: "jwt" },
  callbacks: {
    authorized: async ({ auth }) => {
      return !!auth;
    },
  },
});
