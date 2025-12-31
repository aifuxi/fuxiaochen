import type { Role } from "./role";

export interface Permission {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  code: string;
  description?: string;
  roles?: Role[];
}
