interface BaseResponse {
  code: number;
  message: string;
  data?: unknown;
}

interface KnownBaseResponse<T> {
  code: number;
  message: string;
  data: T;
}
