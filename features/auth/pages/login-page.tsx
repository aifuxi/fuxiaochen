import Image from "next/image";

import { ImageAssets, WEBSITE } from "@/constants";

import { LoginForm } from "../components/login-form";

export const LoginPage = () => {
  return (
    <div className="min-h-svh grid place-content-center">
      <div className="flex flex-col justify-center items-center gap-4">
        <Image src={ImageAssets.logo} width={48} height={48} alt="" />
        <h2 className="text-2xl font-bold">{WEBSITE}</h2>
        <LoginForm />
      </div>
    </div>
  );
};
