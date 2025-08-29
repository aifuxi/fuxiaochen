import { IntroScrollMouse } from "@/components/intro-scroll-mouse";

import { HeroSection } from "@/features/home";

export const revalidate = 60;

export default function Page() {
  return (
    <div className="relative grid h-[calc(100vh-64px)] place-content-center">
      <HeroSection />
      <div
        className={`
          absolute inset-x-0 bottom-8 grid place-content-center
          md:bottom-12
        `}
      >
        <IntroScrollMouse />
      </div>
    </div>
  );
}
