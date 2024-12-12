export type ResponseType<T> = {
  code: number;
  msg: unknown;
  data: T;
};
