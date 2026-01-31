import {
  Changelog,
  ChangelogCreateReq,
  ChangelogListReq,
  ChangelogListResp,
} from "@/types/changelog";
import { prisma } from "@/lib/prisma";
import { IChangelogStore } from "./interface";

export class ChangelogStore implements IChangelogStore {
  async create(data: ChangelogCreateReq): Promise<Changelog> {
    const { version, content, date } = data;
    const changelog = await prisma.changelog.create({
      data: {
        version,
        content,
        date: date || 0,
      },
    });

    return this.mapToDomain(changelog);
  }

  async update(
    id: string,
    data: Partial<ChangelogCreateReq>,
  ): Promise<Changelog | null> {
    const changelog = await prisma.changelog.update({
      where: { id: id },
      data,
    });

    return this.mapToDomain(changelog);
  }

  async delete(id: string): Promise<void> {
    await prisma.changelog.update({
      where: { id: id },
      data: { deletedAt: new Date() },
    });
  }

  async findById(id: string): Promise<Changelog | null> {
    const changelog = await prisma.changelog.findUnique({
      where: { id: id },
    });

    if (!changelog) return null;
    return this.mapToDomain(changelog);
  }

  async findAll(params?: ChangelogListReq): Promise<ChangelogListResp> {
    const {
      page = 1,
      pageSize = 10,
      sortBy = "createdAt",
      order = "desc",
    } = params || {};

    const skip = (page - 1) * pageSize;
    const where = { deletedAt: null };

    const [total, list] = await Promise.all([
      prisma.changelog.count({ where }),
      prisma.changelog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: order },
      }),
    ]);

    return {
      total,
      lists: list.map(this.mapToDomain),
    };
  }

  private mapToDomain(prismaModel: any): Changelog {
    return {
      ...prismaModel,
      id: prismaModel.id.toString(),
      date: Number(prismaModel.date),
      createdAt: prismaModel.createdAt.toISOString(),
      updatedAt: prismaModel.updatedAt.toISOString(),
      deletedAt: prismaModel.deletedAt?.toISOString(),
    };
  }
}
