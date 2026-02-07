import {
  type User,
  type UserListReq,
  type UserListResp,
  type UserUpdateReq,
} from "@/types/user";
import { prisma } from "@/lib/prisma";
import { type IUserStore } from "./interface";

export class UserStore implements IUserStore {
  async update(id: string, data: UserUpdateReq): Promise<User | null> {
    const user = await prisma.user.update({
      where: { id },
      data,
    });

    return this.mapToDomain(user);
  }

  async delete(id: string): Promise<void> {
    // Usually we don't hard delete users, but for now let's allow it or just ignore if not needed.
    // The requirement is "manage users".
    // Schema doesn't have deletedAt for User. So hard delete.
    await prisma.user.delete({
      where: { id },
    });
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;
    return this.mapToDomain(user);
  }

  async findAll(params?: UserListReq): Promise<UserListResp> {
    const { page = 1, pageSize = 10, name, email, role } = params || {};
    const skip = (page - 1) * pageSize;
    const where: any = {};

    if (name) {
      where.name = { contains: name };
    }
    if (email) {
      where.email = { contains: email };
    }
    if (role) {
      where.role = role;
    }

    const [total, list] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      total,
      lists: list.map(this.mapToDomain),
    };
  }

  private mapToDomain(prismaModel: any): User {
    return {
      ...prismaModel,
      createdAt: prismaModel.createdAt.toISOString(),
      updatedAt: prismaModel.updatedAt.toISOString(),
      // User doesn't have deletedAt
    };
  }
}

export const userStore = new UserStore();
