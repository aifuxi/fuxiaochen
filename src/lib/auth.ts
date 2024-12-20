"server only";

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { ZodError } from "zod";

import { loginSchema } from "@/app/auth/login/schema";

import { getUserByEmail } from "@/services/user";

import { comparePassword } from "./bcrypt";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          const { email, password } = await loginSchema.parseAsync(credentials);

          const user = await getUserByEmail(email, { withPassword: true });

          if (!user) {
            throw new Error("邮箱或密码错误");
          }

          const isCorrectPassword = await comparePassword(
            password,
            user.password,
          );

          if (!isCorrectPassword) {
            throw new Error("邮箱或密码错误");
          }

          return {
            email: user.email,
            id: `${user.id}`,
            image: user.image,
            name: user.name,
          };
        } catch (error) {
          if (error instanceof ZodError) {
            // Return `null` to indicate that the credentials are invalid
            return null;
          }
          return null;
        }
      },
    }),
  ],
});
