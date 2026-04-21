export interface Comment {
  id: string;
  postSlug: string;
  author: string;
  email: string;
  content: string;
  createdAt: string;
  status: "pending" | "approved" | "spam";
  replies?: Comment[];
  parentId?: string;
  avatar?: string;
}

export const comments: Comment[] = [
  {
    id: "1",
    postSlug: "building-modern-web-apps-with-nextjs-15",
    author: "Alex Chen",
    email: "alex@example.com",
    content:
      "Great article! The section on Server Components really helped me understand the mental model. Would love to see more content about streaming and suspense boundaries.",
    createdAt: "2024-01-16",
    status: "approved",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
  },
  {
    id: "2",
    postSlug: "building-modern-web-apps-with-nextjs-15",
    author: "Sarah Miller",
    email: "sarah@example.com",
    content:
      "This is exactly what I needed! Been struggling with the app router migration and this clears up a lot of confusion.",
    createdAt: "2024-01-15",
    status: "approved",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
  {
    id: "3",
    postSlug: "building-modern-web-apps-with-nextjs-15",
    author: "Mike Johnson",
    email: "mike@example.com",
    content:
      "How does this compare to Remix? I am trying to decide between the two for my next project.",
    createdAt: "2024-01-14",
    status: "approved",
  },
  {
    id: "4",
    postSlug: "mastering-typescript-advanced-patterns",
    author: "Emily Zhang",
    email: "emily@example.com",
    content:
      "The discriminated unions section was a game changer for me. Finally understand how to properly type my Redux actions!",
    createdAt: "2024-01-12",
    status: "approved",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
  },
  {
    id: "5",
    postSlug: "mastering-typescript-advanced-patterns",
    author: "SpamBot",
    email: "spam@spam.com",
    content: "Check out this amazing deal! Click here for free stuff...",
    createdAt: "2024-01-11",
    status: "spam",
  },
  {
    id: "6",
    postSlug: "the-art-of-clean-code",
    author: "David Park",
    email: "david@example.com",
    content:
      "I would add that writing tests alongside your code also helps enforce clean patterns. Great read overall!",
    createdAt: "2024-01-10",
    status: "approved",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
  {
    id: "7",
    postSlug: "designing-accessible-interfaces",
    author: "Lisa Wang",
    email: "lisa@example.com",
    content:
      "Thank you for covering accessibility! Its often overlooked but so important. The color contrast examples were very helpful.",
    createdAt: "2024-01-09",
    status: "pending",
  },
  {
    id: "8",
    postSlug: "state-management-in-2024",
    author: "Tom Wilson",
    email: "tom@example.com",
    content:
      "Zustand has been my go-to lately. Simple API and great TypeScript support. Have you tried Jotai as well?",
    createdAt: "2024-01-08",
    status: "approved",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
  },
];

export function getCommentsByPostSlug(postSlug: string): Comment[] {
  return comments.filter(
    (c) => c.postSlug === postSlug && c.status === "approved",
  );
}

export function getAllComments(): Comment[] {
  return comments;
}

export function getCommentStats() {
  const all = comments;
  return {
    total: all.length,
    pending: all.filter((c) => c.status === "pending").length,
    approved: all.filter((c) => c.status === "approved").length,
    spam: all.filter((c) => c.status === "spam").length,
  };
}
