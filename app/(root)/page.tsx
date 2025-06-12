import { IntroScrollMouse } from "@/components/intro-scroll-mouse";

import { HeroSection } from "@/features/home";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function Page() {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  return (
    <div className="relative grid h-[calc(100vh-64px)] place-content-center">
      <div>{JSON.stringify(user)}</div>
      <HeroSection />
      <div className="absolute inset-x-0 bottom-8 grid place-content-center md:bottom-12">
        <IntroScrollMouse />
      </div>
    </div>
  );
}
