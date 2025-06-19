import Image from "next/image";
import Link from "next/link";

import { INTERNAL_PATHS } from "@/constants/path";
import { WEBSITE } from "@/constants/website";
import { SignInForm } from "@/features/dashboard/sign-in";

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href={INTERNAL_PATHS.HOME}
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
            <Image
              src={WEBSITE.LOGO}
              alt={WEBSITE.NAME}
              width={1024}
              height={1024}
            />
          </div>
          {WEBSITE.NAME}
        </Link>
        <SignInForm />
      </div>
    </div>
  );
}
