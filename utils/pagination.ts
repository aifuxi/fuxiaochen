export const getSkip = (pageIndex: number, pageSize: number) => {
  return (pageIndex - 1) * pageSize;
};
