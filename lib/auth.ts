import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

import { PrismaAdapter } from "@auth/prisma-adapter";

import { DASHBOARD_WHITE_LIST, INTERNAL_PATHS } from "@/constants/path";

import { prisma } from "./prisma";

export const { handlers, auth, signOut, signIn } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [GithubProvider],
  pages: {
    signIn: INTERNAL_PATHS.DASHBOARD_SIGN_IN,
  },
  debug: process.env.NODE_ENV === "development",
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      // 是否已登录
      const isLoggedIn = !!auth?.user;

      // 是否在 Dashboard 页面
      const isOnDashboard =
        nextUrl.pathname.startsWith(INTERNAL_PATHS.DASHBOARD) &&
        !DASHBOARD_WHITE_LIST.includes(nextUrl.pathname);

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL(INTERNAL_PATHS.DASHBOARD, nextUrl));
      }

      return true;
    },
  },
});
