export interface Friend {
  id: string;
  name: string;
  url: string;
  avatar: string;
  description: string;
  category: "developer" | "designer" | "blogger" | "creator";
}

export const friends: Friend[] = [
  {
    id: "1",
    name: "Anthony Fu",
    url: "https://antfu.me",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    description:
      "A fanatical open sourcerer. Core team of Vue, Vite, and Nuxt.",
    category: "developer",
  },
  {
    id: "2",
    name: "Josh Comeau",
    url: "https://joshwcomeau.com",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    description: "Software developer and educator, focused on React and CSS.",
    category: "developer",
  },
  {
    id: "3",
    name: "Sarah Drasner",
    url: "https://sarahdrasnerdesign.com",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    description: "VP of Developer Experience at Netlify. Author and speaker.",
    category: "developer",
  },
  {
    id: "4",
    name: "Addy Osmani",
    url: "https://addyosmani.com",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    description: "Engineering Manager at Google working on Chrome.",
    category: "developer",
  },
  {
    id: "5",
    name: "Cassie Evans",
    url: "https://cassie.codes",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    description: "Creative developer and SVG animation enthusiast.",
    category: "designer",
  },
  {
    id: "6",
    name: "Dan Abramov",
    url: "https://overreacted.io",
    avatar:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop",
    description: "Working on React. Co-author of Redux and Create React App.",
    category: "developer",
  },
  {
    id: "7",
    name: "Wes Bos",
    url: "https://wesbos.com",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
    description:
      "Full Stack Developer and teacher. Makes web development courses.",
    category: "creator",
  },
  {
    id: "8",
    name: "Una Kravets",
    url: "https://una.im",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    description: "Developer Advocate at Google. CSS and web standards expert.",
    category: "designer",
  },
];

export function getAllFriends(): Friend[] {
  return friends;
}

export function getFriendsByCategory(category: Friend["category"]): Friend[] {
  return friends.filter((f) => f.category === category);
}
