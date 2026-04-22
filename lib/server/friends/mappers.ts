import type { Friend } from "@/lib/db/schema";

export type PublicFriend = {
  id: string;
  name: string;
  url: string;
  avatar: string;
  description: string;
  category: Friend["category"];
};

export type AdminFriend = {
  id: string;
  name: string;
  url: string;
  avatar: string;
  description: string;
  category: Friend["category"];
  createdAt: string;
  updatedAt: string;
};

export function toPublicFriend(friend: Friend): PublicFriend {
  return {
    id: friend.id,
    name: friend.name,
    url: friend.url,
    avatar: friend.avatar,
    description: friend.description,
    category: friend.category,
  };
}

export function toAdminFriend(friend: Friend): AdminFriend {
  return {
    id: friend.id,
    name: friend.name,
    url: friend.url,
    avatar: friend.avatar,
    description: friend.description,
    category: friend.category,
    createdAt: friend.createdAt.toISOString(),
    updatedAt: friend.updatedAt.toISOString(),
  };
}
