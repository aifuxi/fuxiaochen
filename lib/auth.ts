import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/db";
import {
  getRegistrationRole,
  isAdminRole,
  type UserRole,
} from "@/lib/user/user-role";

const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mysql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        async before() {
          const adminUser = await prisma.user.findFirst({
            select: {
              id: true,
            },
            where: {
              role: "Admin",
            },
          });

          return {
            data: {
              role: getRegistrationRole(Boolean(adminUser)),
            },
          };
        },
      },
    },
  },
  plugins: [nextCookies()],
  user: {
    additionalFields: {
      role: {
        defaultValue: "Normal",
        input: false,
        required: false,
        type: "string",
      },
    },
  },
  socialProviders:
    githubClientId && githubClientSecret
      ? {
          github: {
            clientId: githubClientId,
            clientSecret: githubClientSecret,
          },
        }
      : undefined,
});

type AuthSessionUser = {
  email: string;
  name: string;
  role?: UserRole;
};

type AuthSession = {
  user: AuthSessionUser;
};

export async function getAuthSession() {
  return (await auth.api.getSession({
    headers: await headers(),
  })) as AuthSession | null;
}

export async function requireCmsSession() {
  const session = await getAuthSession();

  if (!session) {
    redirect("/cms/login");
  }

  return session;
}

export async function requireCmsAdminSession() {
  const session = await requireCmsSession();
  console.log("session", session);

  if (!isAdminRole(session.user.role)) {
    redirect("/cms/dashboard");
  }

  return session;
}
