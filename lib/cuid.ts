import cuid2 from "@paralleldrive/cuid2";

export const createCuid = () => {
  return cuid2.createId();
};

export const isCuid = (id: string) => {
  return cuid2.isCuid(id);
};
