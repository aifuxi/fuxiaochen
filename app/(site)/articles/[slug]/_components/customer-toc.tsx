'use client';

import React from 'react';

export function CustomerToc() {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const toc = document.getElementsByClassName('toc')?.[0];

    if (toc) {
      ref.current?.append(toc);
    }
  }, []);

  return (
    <div
      ref={ref}
      className="hidden lg:block w-[280px] sticky top-28 h-[400px] text-muted-foreground text-sm"
    ></div>
  );
}
