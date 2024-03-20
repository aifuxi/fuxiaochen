import React from 'react';

export const IntroScrollMouse = () => {
  return (
    <div className="w-[20px] h-[30px] md:w-[26px] md:h-[38px] rounded-full border-2 border-primary/30 relative grid justify-center pt-2">
      <div className="w-[2px] h-[5px] md:h-[7px] bg-primary/30  rounded-full animate-intro-scroll"></div>
    </div>
  );
};
