import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  FileText,
  Folder,
  History,
  LayoutDashboard,
  Link2,
  MessageSquare,
  Plus,
  Search,
  Settings2,
  Tags,
  Users,
} from "lucide-react";
import type { LucideProps } from "lucide-react";

const icons = {
  "bar-chart-3": BarChart3,
  bell: Bell,
  "briefcase-business": BriefcaseBusiness,
  "file-text": FileText,
  folder: Folder,
  history: History,
  "layout-dashboard": LayoutDashboard,
  "link-2": Link2,
  "message-square": MessageSquare,
  plus: Plus,
  search: Search,
  "settings-2": Settings2,
  tags: Tags,
  users: Users,
} satisfies Record<string, React.ComponentType<LucideProps>>;

export function LucideIcon({ name, ...props }: LucideProps & { name: keyof typeof icons }) {
  const Component = icons[name];

  return <Component {...props} />;
}
