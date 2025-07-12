import { useMutation } from "@tanstack/react-query";

import { login, register } from "./api";

export function useAuthLogin() {
  return useMutation({
    mutationKey: ["auth/login"],
    mutationFn: login,
  });
}

export function useAuthRegister() {
  return useMutation({
    mutationKey: ["auth/register"],
    mutationFn: register,
  });
}
