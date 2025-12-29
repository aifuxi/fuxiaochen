export interface CommonResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface CommonModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListReq {
  page: number;
  pageSize: number;
}
