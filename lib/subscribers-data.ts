export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  subscribedAt: string;
  status: "active" | "unsubscribed";
  source: "blog" | "newsletter" | "popup";
}

export const subscribers: Subscriber[] = [
  {
    id: "1",
    email: "alex.chen@example.com",
    name: "Alex Chen",
    subscribedAt: "2024-01-15",
    status: "active",
    source: "blog",
  },
  {
    id: "2",
    email: "sarah.m@example.com",
    name: "Sarah Miller",
    subscribedAt: "2024-01-14",
    status: "active",
    source: "newsletter",
  },
  {
    id: "3",
    email: "mike.j@example.com",
    subscribedAt: "2024-01-13",
    status: "active",
    source: "popup",
  },
  {
    id: "4",
    email: "emily.z@example.com",
    name: "Emily Zhang",
    subscribedAt: "2024-01-12",
    status: "active",
    source: "blog",
  },
  {
    id: "5",
    email: "david.p@example.com",
    name: "David Park",
    subscribedAt: "2024-01-10",
    status: "unsubscribed",
    source: "newsletter",
  },
  {
    id: "6",
    email: "lisa.w@example.com",
    name: "Lisa Wang",
    subscribedAt: "2024-01-09",
    status: "active",
    source: "blog",
  },
  {
    id: "7",
    email: "tom.w@example.com",
    subscribedAt: "2024-01-08",
    status: "active",
    source: "popup",
  },
  {
    id: "8",
    email: "jenny.l@example.com",
    name: "Jenny Lee",
    subscribedAt: "2024-01-07",
    status: "active",
    source: "newsletter",
  },
  {
    id: "9",
    email: "robert.k@example.com",
    name: "Robert Kim",
    subscribedAt: "2024-01-05",
    status: "active",
    source: "blog",
  },
  {
    id: "10",
    email: "anna.s@example.com",
    subscribedAt: "2024-01-03",
    status: "unsubscribed",
    source: "popup",
  },
  {
    id: "11",
    email: "chris.b@example.com",
    name: "Chris Brown",
    subscribedAt: "2024-01-02",
    status: "active",
    source: "blog",
  },
  {
    id: "12",
    email: "maria.g@example.com",
    name: "Maria Garcia",
    subscribedAt: "2024-01-01",
    status: "active",
    source: "newsletter",
  },
];

export function getAllSubscribers(): Subscriber[] {
  return subscribers;
}

export function getSubscriberStats() {
  const all = subscribers;
  return {
    total: all.length,
    active: all.filter((s) => s.status === "active").length,
    unsubscribed: all.filter((s) => s.status === "unsubscribed").length,
    fromBlog: all.filter((s) => s.source === "blog").length,
    fromNewsletter: all.filter((s) => s.source === "newsletter").length,
    fromPopup: all.filter((s) => s.source === "popup").length,
  };
}

export function getRecentSubscribers(limit: number = 5): Subscriber[] {
  return [...subscribers]
    .sort(
      (a, b) =>
        new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime(),
    )
    .slice(0, limit);
}
