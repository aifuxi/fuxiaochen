import axios from "axios";
import z from "zod";

export const request = axios.create();

request.interceptors.response.use((config) => {
  return config.data;
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
