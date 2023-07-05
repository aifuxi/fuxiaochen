import * as React from 'react';
import { SVGProps } from 'react';

const IconJuejin = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    >
      <path d="m2 12 10 7.422L22 12" />
      <path d="m7 9 5 4 5-4m-6-3 1 .8 1-.8-1-.8z" />
    </g>
  </svg>
);
export default IconJuejin;
