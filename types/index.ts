export type SortOrder = "asc" | "desc";

export interface OptionItem<T> {
  value: T;
  label: string;
}

export interface BaseResponse {
  code: number;
  message: string;
  data?: unknown;
}

export interface KnownBaseResponse<T> {
  code: number;
  message: string;
  data: T;
}
