import * as React from "react";

export const IntroScrollMouse = () => {
  return (
    <div
      className={`
        relative grid h-[30px] w-[20px] justify-center rounded-full border-2 border-primary/30 pt-2
        md:h-[38px] md:w-[26px]
      `}
    >
      <div
        className={`
          h-[5px] w-[2px] rounded-full bg-primary/30
          md:h-[7px]
        `}
      ></div>
    </div>
  );
};
