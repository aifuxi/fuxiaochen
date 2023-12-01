import { type SVGProps } from 'react';

export const IconLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 64 64"
    {...props}
  >
    <g clipPath="url(#a)">
      <path fill="hsl(var(--primary))" d="M0 0h64v48L48 64H0V0Z" />
      <path
        fill="hsl(var(--primary-foreground))"
        d="M20.928 51V15.624h25.104v6.384H28.416v8.352h15.456v6.144H28.416V51h-7.488Z"
      />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="hsl(var(--primary-foreground))" d="M0 0h64v64H0z" />
      </clipPath>
    </defs>
  </svg>
);
