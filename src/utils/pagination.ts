export const getSkip = (page: number, pageSize: number) => {
  return (page - 1) * pageSize;
};
