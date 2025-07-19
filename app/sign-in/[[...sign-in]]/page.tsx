import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="grid h-svh w-svw place-content-center">
      <SignIn />
    </div>
  );
}
