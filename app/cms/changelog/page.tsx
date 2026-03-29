"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Calendar,
  Edit2,
  Trash2,
  ChevronDown,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type ChangeType = "added" | "improved" | "bugfix" | "changed" | "removed";

interface Change {
  type: ChangeType;
  title: string;
  details: string;
}

interface ChangelogEntry {
  id: string;
  version: string;
  date: string;
  title: string;
  description: string;
  changes: Change[];
  major: boolean;
}

// Change type styles
const changeTypeStyles: Record<
  ChangeType,
  { bg: string; text: string; label: string }
> = {
  added: { bg: "bg-green-500/15", text: "text-green-500", label: "Added" },
  improved: { bg: "bg-blue-500/15", text: "text-blue-500", label: "Improved" },
  bugfix: { bg: "bg-red-500/15", text: "text-red-500", label: "Fixed" },
  changed: { bg: "bg-yellow-500/15", text: "text-yellow-500", label: "Changed" },
  removed: { bg: "bg-gray-500/15", text: "text-gray-400", label: "Removed" },
};

// Mock data
const initialChangelogData: ChangelogEntry[] = [
  {
    id: "1",
    version: "v2.0.0",
    date: "2026-03-15",
    title: "Major Design System Overhaul",
    description:
      "Complete redesign of the component library with a new visual language.",
    changes: [
      {
        type: "added",
        title: "New Design Tokens",
        details: "Introduced semantic color tokens.",
      },
      {
        type: "added",
        title: "Dark Mode Support",
        details: "Full dark mode implementation.",
      },
      {
        type: "improved",
        title: "Performance",
        details: "Reduced bundle size by 40%.",
      },
    ],
    major: true,
  },
  {
    id: "2",
    version: "v1.5.2",
    date: "2026-02-28",
    title: "Bug Fixes & Performance",
    description: "Monthly maintenance release focusing on bug fixes.",
    changes: [
      {
        type: "bugfix",
        title: "Memory Leak in Charts",
        details: "Fixed memory leak on resize.",
      },
      {
        type: "improved",
        title: "Animation Performance",
        details: "Optimized for 60fps on mobile.",
      },
    ],
    major: false,
  },
  {
    id: "3",
    version: "v1.5.0",
    date: "2026-02-14",
    title: "Valentine's Day Update",
    description: "New components and improvements.",
    changes: [
      {
        type: "added",
        title: "Date Range Picker",
        details: "New component with presets.",
      },
      {
        type: "added",
        title: "Toast Notifications",
        details: "New toast system with auto-dismiss.",
      },
    ],
    major: false,
  },
  {
    id: "4",
    version: "v1.4.0",
    date: "2026-01-30",
    title: "Accessibility Update",
    description: "Major accessibility improvements.",
    changes: [
      {
        type: "improved",
        title: "WCAG 2.1 AA Compliance",
        details: "All components now meet standards.",
      },
      {
        type: "added",
        title: "Keyboard Navigation",
        details: "Complete keyboard nav support.",
      },
    ],
    major: false,
  },
];

// Change Tag Component
function ChangeTag({ type }: { type: ChangeType }) {
  const style = changeTypeStyles[type];
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1 font-mono text-xs font-medium tracking-wider uppercase",
        style.bg,
        style.text,
      ].join(" ")}
    >
      {style.label}
    </span>
  );
}

// Stats Card Component
function StatsCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={["rounded-lg p-3", color].join(" ")}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted">{label}</p>
            <p className="text-2xl font-semibold text-foreground">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Changelog Item Row Component
function ChangelogItemRow({
  item,
  onEdit,
  onDelete,
}: {
  item: ChangelogEntry;
  onEdit: (item: ChangelogEntry) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        border-b border-border
        last:border-0
      `}
    >
      <div className={`
        flex items-center justify-between p-4 transition-colors
        hover:bg-secondary/30
      `}>
        <div className="flex items-center gap-4">
          <Badge
            variant={item.major ? "primary" : "secondary"}
            className="font-mono"
          >
            {item.version}
          </Badge>
          <div>
            <h3 className="font-medium text-foreground">{item.title}</h3>
            <p className="text-sm text-muted">{item.date}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex flex-wrap gap-1">
            {item.changes.slice(0, 3).map((change, idx) => (
              <ChangeTag key={idx} type={change.type} />
            ))}
            {item.changes.length > 3 && (
              <span className="text-xs text-muted">
                +{item.changes.length - 3} more
              </span>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setExpanded(!expanded)}
          >
            <ChevronDown
              className={`
                h-4 w-4 transition-transform
                ${
                expanded ? "rotate-180" : ""
              }
              `}
            />
          </Button>

          <Button variant="ghost" size="icon-xs" onClick={() => onEdit(item)}>
            <Edit2 className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onDelete(item.id)}
            className={`
              text-destructive
              hover:text-destructive
            `}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-4 pb-4"
        >
          <p className="mb-4 text-sm text-muted">{item.description}</p>
          <div className="space-y-2 rounded-lg bg-secondary/50 p-4">
            {item.changes.map((change, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <ChangeTag type={change.type} />
                <div>
                  <span className="font-medium text-foreground">
                    {change.title}
                  </span>
                  <p className="text-sm text-muted">{change.details}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// Add/Edit Form Component
function ChangelogForm({
  item,
  onSave,
  onCancel,
}: {
  item?: ChangelogEntry;
  onSave: (item: ChangelogEntry) => void;
  onCancel: () => void;
}) {
  const [version, setVersion] = useState(item?.version || "");
  const [date, setDate] = useState(item?.date || "");
  const [title, setTitle] = useState(item?.title || "");
  const [description, setDescription] = useState(item?.description || "");
  const [major, setMajor] = useState(item?.major || false);
  const [changes, setChanges] = useState<Change[]>(item?.changes || []);

  const addChange = () => {
    setChanges([...changes, { type: "added", title: "", details: "" }]);
  };

  const updateChange = (index: number, field: keyof Change, value: string) => {
    setChanges((prev) => {
      const current = prev[index];
      if (!current) return prev;
      const updated: Change = {
        type: field === "type" ? (value as ChangeType) : current.type,
        title: field === "title" ? value : current.title,
        details: field === "details" ? value : current.details,
      };
      const newChanges = [...prev];
      newChanges[index] = updated;
      return newChanges;
    });
  };

  const removeChange = (index: number) => {
    setChanges(changes.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: item?.id || Date.now().toString(),
      version,
      date,
      title,
      description,
      changes,
      major,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="version">Version</Label>
          <Input
            id="version"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="v1.0.0"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Release title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the release..."
          rows={3}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="major"
          checked={major}
          onChange={(e) => setMajor(e.target.checked)}
          className={`
            h-4 w-4 rounded border-border bg-secondary text-primary
            focus:ring-primary
          `}
        />
        <Label htmlFor="major">Major release</Label>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Changes</Label>
          <Button type="button" variant="outline" size="sm" onClick={addChange}>
            <Plus className="h-4 w-4" />
            Add Change
          </Button>
        </div>

        {changes.map((change, index) => (
          <div
            key={index}
            className="space-y-2 rounded-lg border border-border p-3"
          >
            <div className="flex items-center gap-2">
              <select
                value={change.type}
                onChange={(e) =>
                  updateChange(index, "type", e.target.value)
                }
                className="rounded-md border border-border bg-secondary px-2 py-1 text-sm"
              >
                <option value="added">Added</option>
                <option value="improved">Improved</option>
                <option value="bugfix">Fixed</option>
                <option value="changed">Changed</option>
                <option value="removed">Removed</option>
              </select>
              <Input
                value={change.title}
                onChange={(e) => updateChange(index, "title", e.target.value)}
                placeholder="Change title"
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => removeChange(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <Input
              value={change.details}
              onChange={(e) =>
                updateChange(index, "details", e.target.value)
              }
              placeholder="Details (optional)"
            />
          </div>
        ))}
      </div>

      <DialogFooter>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{item ? "Update" : "Create"}</Button>
      </DialogFooter>
    </form>
  );
}

// Filter Bar Component
function FilterBar({
  filter,
  setFilter,
  searchQuery,
  setSearchQuery,
}: {
  filter: ChangeType | "all";
  setFilter: (filter: ChangeType | "all") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) {
  const filters: { value: ChangeType | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "added", label: "Added" },
    { value: "improved", label: "Improved" },
    { value: "bugfix", label: "Fixed" },
    { value: "changed", label: "Changed" },
    { value: "removed", label: "Removed" },
  ];

  return (
    <div className="mb-6 flex flex-wrap items-center gap-4">
      <div className="relative min-w-64 flex-1">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search changelogs..."
          className="pl-10"
        />
      </div>

      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted" />
        {filters.map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? "default" : "secondary"}
            size="sm"
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

// Main Page Component
export default function ChangelogPage() {
  const [changelogData, setChangelogData] =
    useState<ChangelogEntry[]>(initialChangelogData);
  const [filter, setFilter] = useState<ChangeType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ChangelogEntry | undefined>();

  const stats = {
    total: changelogData.length,
    major: changelogData.filter((item) => item.major).length,
    additions: changelogData.reduce(
      (acc, item) =>
        acc + item.changes.filter((c) => c.type === "added").length,
      0
    ),
    fixes: changelogData.reduce(
      (acc, item) =>
        acc + item.changes.filter((c) => c.type === "bugfix").length,
      0
    ),
  };

  const filteredData = changelogData.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.version.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filter === "all" || item.changes.some((c) => c.type === filter);

    return matchesSearch && matchesFilter;
  });

  const handleEdit = (item: ChangelogEntry) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setChangelogData(changelogData.filter((item) => item.id !== id));
  };

  const handleSave = (item: ChangelogEntry) => {
    if (editingItem) {
      setChangelogData(
        changelogData.map((i) => (i.id === item.id ? item : i))
      );
    } else {
      setChangelogData([item, ...changelogData]);
    }
    setDialogOpen(false);
    setEditingItem(undefined);
  };

  const handleCreate = () => {
    setEditingItem(undefined);
    setDialogOpen(true);
  };

  return (
    <div>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 font-serif text-3xl font-semibold text-foreground">
              Changelog
            </h1>
            <p className="text-muted">
              Track all updates, improvements, and bug fixes.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4" />
                  New Entry
                </Button>
              }
            />
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Edit Changelog Entry" : "Create Changelog Entry"}
                </DialogTitle>
                <DialogDescription>
                  {editingItem
                    ? "Update the changelog entry details."
                    : "Add a new changelog entry to track your updates."}
                </DialogDescription>
              </DialogHeader>
              <ChangelogForm
                item={editingItem}
                onSave={handleSave}
                onCancel={() => setDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-4 gap-6">
        <StatsCard
          icon={Calendar}
          label="Total Releases"
          value={stats.total}
          color="bg-primary/15 text-primary"
        />
        <StatsCard
          icon={ArrowUpDown}
          label="Major Versions"
          value={stats.major}
          color="bg-yellow-500/15 text-yellow-500"
        />
        <StatsCard
          icon={Plus}
          label="New Features"
          value={stats.additions}
          color="bg-green-500/15 text-green-500"
        />
        <StatsCard
          icon={Edit2}
          label="Bug Fixes"
          value={stats.fixes}
          color="bg-red-500/15 text-red-500"
        />
      </div>

      {/* Filter Bar */}
      <FilterBar
        filter={filter}
        setFilter={setFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Changelog List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-muted" />
            Release History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredData.length === 0 ? (
            <div className="p-8 text-center text-muted">
              No changelog entries found.
            </div>
          ) : (
            filteredData.map((item) => (
              <ChangelogItemRow
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
