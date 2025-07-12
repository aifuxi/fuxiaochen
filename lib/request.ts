import axios from "axios";
import type z from "zod";

import { ERROR_CODES } from "@/constants";

export const request = axios.create();

request.interceptors.response.use((config) => {
  if (config?.data && config?.data?.code !== ERROR_CODES.ok) {
    return Promise.reject(
      new Error(config?.data?.message ?? "系统繁忙，请稍后重试"),
    );
  }

  return config?.data?.data;
});

export async function getJsonBody(request: Request) {
  try {
    return await request.clone().json();
  } catch {
    return undefined;
  }
}

export function getErrorMessages(error: z.ZodError): string[] {
  return Object.entries(error.format())
    .map(([key, value]) => {
      const messages = (value as unknown as { _errors: string[] })._errors;
      return messages ? `${key}: ${messages.join(", ")}` : "";
    })
    .filter(Boolean);
}
