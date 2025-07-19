"use client";

import { SignOutButton, useUser } from "@clerk/nextjs";
import { Button } from "@heroui/react";

export default function Page() {
  const { isSignedIn, user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <div>Sign in to view this page</div>;
  }

  return (
    <div>
      Hello {user.emailAddresses?.join("-")}!
      <div>
        <SignOutButton>
          <Button>退出登录</Button>
        </SignOutButton>
      </div>
    </div>
  );
}
