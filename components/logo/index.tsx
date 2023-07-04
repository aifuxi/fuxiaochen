import { SVGProps } from 'react';

const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 360 360"
    {...props}
  >
    <g clipPath="url(#a)">
      <rect width={360} height={360} fill="#000" rx={180} />
      <path
        fill="#fff"
        d="M250.224 76.298v33.787h-87.009v53.521h66.677v33.189h-66.677V285h-41.86V76.298h128.869Z"
      />
    </g>
    <defs>
      <clipPath id="a">
        <rect width={360} height={360} fill="#fff" rx={180} />
      </clipPath>
    </defs>
  </svg>
);
export default Logo;
