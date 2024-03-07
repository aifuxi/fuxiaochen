import { z } from 'zod';

export const createUserReqSchema = z.object({
  name: z.string().min(1, { message: '长度不能少于1个字符' }),
  email: z.string().email().min(1, { message: '长度不能少于1个字符' }),
  password: z.string().min(1, { message: '长度不能少于1个字符' }),
  confirmPassword: z.string().min(1, { message: '长度不能少于1个字符' }),
});

export type CreateUserReq = z.infer<typeof createUserReqSchema>;

export const signInUserReqSchema = z.object({
  email: z.string().email().min(1, { message: '长度不能少于1个字符' }),
  password: z.string().min(1, { message: '长度不能少于1个字符' }),
});

export type SignInUserReq = z.infer<typeof signInUserReqSchema>;
