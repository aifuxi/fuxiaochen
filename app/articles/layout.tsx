import React from 'react';

const ArticlesLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col space-y-8">
      <h1
        className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900
  sm:text-4xl sm:leading-10  border-b py-8"
      >
        全部文章
      </h1>
      {children}
    </div>
  );
};

export default ArticlesLayout;
