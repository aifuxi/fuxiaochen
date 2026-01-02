export interface CommonResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface CommonModel {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListReq {
  page: number;
  pageSize: number;
}
