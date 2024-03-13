import { IntroScrollMouse } from '@/components/intro-scroll-mouse';

import { HeroSectionWithCssAnimation } from '@/features/home';

export default function Page() {
  return (
    <div>
      <div className="h-[calc(100vh-64px)] grid place-content-center relative">
        <HeroSectionWithCssAnimation />
        <div className="grid place-content-center absolute bottom-12 inset-x-0">
          <IntroScrollMouse />
        </div>
      </div>
    </div>
  );
}
