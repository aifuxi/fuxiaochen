import {
  type User,
  type UserListReq,
  type UserListResp,
  type UserUpdateReq,
} from "@/types/user";

export interface IUserStore {
  update(id: string, data: UserUpdateReq): Promise<User | null>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<User | null>;
  findAll(params?: UserListReq): Promise<UserListResp>;
}
