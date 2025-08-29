"use server";

import { hash } from "bcryptjs";
import { z } from "zod";

import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const signUpSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function signUpWithEmail(values: z.infer<typeof signUpSchema>) {
  const validatedFields = signUpSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { name, email, password } = validatedFields.data;
  const hashedPassword = await hash(password, 10);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "Email already in use!" };
  }

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  return { success: "User created successfully!" };
}
