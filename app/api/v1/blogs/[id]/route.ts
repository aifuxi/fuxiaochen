import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { businessError, success } from "@/lib/response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const blog = await prisma.blog.findUnique({
      where: { id: BigInt(id) },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
    if (!blog) return businessError("Blog not found");

    const formattedBlog = {
      ...blog,
      tags: blog.tags.map((bt) => bt.tag),
    };

    return success(formattedBlog);
  } catch (e: any) {
    return businessError(e.message);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const {
      title,
      slug,
      description,
      content,
      cover,
      categoryId,
      tagIds,
      published,
      featured,
    } = body;

    const data: any = {
      title,
      slug,
      description,
      content,
      cover,
      published,
      featured,
    };

    if (published === true) {
      // Logic: if already published, don't update date? Or update?
      // Usually only set date on first publish.
      // But here simple logic: if passed, update.
      // Better: check if published changed.
      // For now, I'll update PublishedAt if published is true.
      // Or maybe check existing.
    }

    if (categoryId) {
      data.category = { connect: { id: BigInt(categoryId) } };
    }

    if (tagIds) {
      data.tags = {
        deleteMany: {}, // Remove existing
        create: tagIds.map((tid: string) => ({
          tag: { connect: { id: BigInt(tid) } },
        })),
      };
    }

    const blog = await prisma.blog.update({
      where: { id: BigInt(id) },
      data,
    });

    return success(blog);
  } catch (e: any) {
    return businessError(e.message);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    // Hard delete or soft delete? Go model has DeletedAt.
    // If I use soft delete, I update deletedAt.
    // But existing Go code GORM logic with `gorm.DeletedAt` usually does soft delete by default.
    // I'll simulate soft delete.
    await prisma.blog.update({
      where: { id: BigInt(id) },
      data: { deletedAt: new Date() },
    });

    // Or if I want real delete:
    // await prisma.blog.delete({ where: { id: BigInt(id) } });

    return success(null);
  } catch (e: any) {
    return businessError(e.message);
  }
}
