export type GeneralResponse<T> = {
  code: number;
  data?: T;
  msg?: string;
  error?: string;
};

export type TotalResponse<T> = GeneralResponse<T> & {
  total: number;
};

export type URLStruct = {
  url: string;
};
