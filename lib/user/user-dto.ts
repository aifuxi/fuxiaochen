import { z } from "zod";

import { userRoleValues } from "@/lib/user/user-role";

type UserRecord = {
  _count: {
    accounts: number;
    sessions: number;
  };
  createdAt: Date;
  email: string;
  emailVerified: boolean;
  id: string;
  image: string | null;
  name: string;
  role: (typeof userRoleValues)[number];
  updatedAt: Date;
};

const normalizedImageSchema = z.preprocess((value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    return trimmedValue.length > 0 ? trimmedValue : null;
  }

  return value;
}, z.string().nullable().optional());

const normalizedEmailSchema = z
  .string({
    error: "Email must be a string.",
  })
  .trim()
  .min(1, "Email is required.")
  .max(255, "Email must not exceed 255 characters.")
  .email("Please enter a valid email address.")
  .transform((value) => value.toLowerCase());

const normalizedPasswordSchema = z
  .string({
    error: "Password must be a string.",
  })
  .min(8, "Password must be at least 8 characters.")
  .max(128, "Password must not exceed 128 characters.");

const normalizedStringIdSchema = z
  .string({
    error: "User id must be a string.",
  })
  .trim()
  .min(1, "User id is required.")
  .max(191, "User id is too long.");

export const userIdSchema = normalizedStringIdSchema;

export const listUsersQuerySchema = z.object({
  keyword: z
    .string()
    .trim()
    .transform((value) => value || undefined)
    .optional(),
  role: z.enum(userRoleValues).optional(),
  page: z.coerce
    .number({
      error: "Page must be a number.",
    })
    .int("Page must be an integer.")
    .min(1, "Page must be at least 1.")
    .default(1),
  pageSize: z.coerce
    .number({
      error: "Page size must be a number.",
    })
    .int("Page size must be an integer.")
    .min(1, "Page size must be at least 1.")
    .max(50, "Page size must not exceed 50.")
    .default(10),
});

export const createUserBodySchema = z.object({
  email: normalizedEmailSchema,
  emailVerified: z.boolean().default(false),
  image: normalizedImageSchema,
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(100, "Name must not exceed 100 characters."),
  password: normalizedPasswordSchema,
  role: z.enum(userRoleValues).default("Normal"),
});

export const updateUserBodySchema = z
  .object({
    email: normalizedEmailSchema.optional(),
    emailVerified: z.boolean().optional(),
    image: normalizedImageSchema,
    name: z.string().trim().min(2, "Name must be at least 2 characters.").max(100, "Name must not exceed 100 characters.").optional(),
    password: normalizedPasswordSchema.optional(),
    role: z.enum(userRoleValues).optional(),
  })
  .refine(
    (value) =>
      value.email !== undefined ||
      value.emailVerified !== undefined ||
      value.image !== undefined ||
      value.name !== undefined ||
      value.password !== undefined ||
      value.role !== undefined,
    {
      message: "At least one field must be provided.",
      path: [],
    },
  );

export type UserDto = {
  accountCount: number;
  createdAt: string;
  email: string;
  emailVerified: boolean;
  id: string;
  image: string | null;
  name: string;
  role: (typeof userRoleValues)[number];
  sessionCount: number;
  updatedAt: string;
};

export type CreateUserInput = z.infer<typeof createUserBodySchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type UpdateUserInput = z.infer<typeof updateUserBodySchema>;

export function toUserDto(user: UserRecord): UserDto {
  return {
    accountCount: user._count.accounts,
    createdAt: user.createdAt.toISOString(),
    email: user.email,
    emailVerified: user.emailVerified,
    id: user.id,
    image: user.image,
    name: user.name,
    role: user.role,
    sessionCount: user._count.sessions,
    updatedAt: user.updatedAt.toISOString(),
  };
}
