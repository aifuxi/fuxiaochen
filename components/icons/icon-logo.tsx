import { type SVGProps } from 'react';

export const IconLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 48 48"
    {...props}
  >
    <rect width={48} height={48} fill="hsl(var(--primary))" rx={12} />
    <path
      fill="hsl(var(--primary-foreground))"
      fillRule="evenodd"
      d="M13.176 9.422h21.621v7.217c0 .615-.498 1.113-1.113 1.113H13.176v-8.33Zm9.011 10.412h10.811v7.217c0 .615-.498 1.113-1.113 1.113h-9.698v-8.33Zm-9.011 0v18.744h6.093c.615 0 1.114-.498 1.114-1.114v-17.63h-7.207Z"
      clipRule="evenodd"
    />
  </svg>
);
