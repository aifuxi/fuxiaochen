"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { PATHS } from "@/constants";
import { createClient } from "@/lib/supabase/server";

export async function signInWithGithub() {
  const h = await headers();
  const origin = h.get("origin");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      // 注意这里需要一个完整的http链接，否则会报错
      redirectTo: `${origin}${PATHS.AUTH_CALLBACK}`,
    },
  });

  if (error) {
    console.error(error);
    redirect(PATHS.ERROR);
  } else if (data?.url) {
    redirect(data.url);
  }
}
