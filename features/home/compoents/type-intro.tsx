"use client";

import * as React from "react";
import { TypeAnimation } from "react-type-animation";

export const TypeIntro = () => {
  return (
    <TypeAnimation
      className="text-2xl tracking-widest md:text-5xl"
      sequence={[
        500,
        "一名前端开发工程师 。",
        1000,
        "A Web <Developer /> .",
        1000,
      ]}
      speed={10}
      repeat={Infinity}
    />
  );
};
