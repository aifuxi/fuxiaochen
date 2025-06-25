import Image from "next/image";

import { ILLUSTRATIONS } from "@/constants/assets";
import { WEBSITE } from "@/constants/website";

export default function LoginPage() {
  return (
    <div className="min-h-svh grid grid-cols-[480px_1fr] relative">
      <div className="absolute top-0 inset-x-0 h-[72px] px-6 flex items-center border-b">
        <div className="size-10">
          <Image
            src={WEBSITE.LOGO}
            alt={WEBSITE.NAME}
            width={1024}
            height={1024}
          />
        </div>
      </div>
      <div className="bg-muted pt-[72px] p-6 flex flex-col justify-center items-center gap-6">
        <h2 className="text-2xl font-bold">嗨，欢迎回来~</h2>

        <div>少抱怨，多思考，未来更美好。</div>
        <Image
          src={ILLUSTRATIONS.DEVELOPER_ACTIVITY_BRO}
          alt={WEBSITE.NAME}
          width={432}
          height={432}
          objectFit="contain"
        />
      </div>
      <div className="pt-[72px]">Login</div>
    </div>
  );
}
