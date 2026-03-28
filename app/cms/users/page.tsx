"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Search, Edit2, Trash2, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input, InputWrapper, InputIcon } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type Role = "admin" | "author" | "reader";
type Status = "active" | "inactive";

interface User {
  id: number;
  name: string;
  email: string;
  initials: string;
  avatarColor: string;
  role: Role;
  status: Status;
  articles: number;
  joined: string;
}

const usersData: User[] = [
  {
    id: 1,
    name: "Sarah Chen",
    email: "sarah@superblog.dev",
    initials: "SC",
    avatarColor: "bg-gradient-to-br from-indigo-500 to-purple-600",
    role: "admin",
    status: "active",
    articles: 42,
    joined: "Dec 1, 2023",
  },
  {
    id: 2,
    name: "John Doe",
    email: "john@superblog.dev",
    initials: "JD",
    avatarColor: "bg-gradient-to-br from-emerald-500 to-teal-600",
    role: "author",
    status: "active",
    articles: 28,
    joined: "Jan 15, 2024",
  },
  {
    id: 3,
    name: "Emily Martinez",
    email: "emily.m@superblog.dev",
    initials: "EM",
    avatarColor: "bg-gradient-to-br from-pink-500 to-rose-600",
    role: "author",
    status: "active",
    articles: 15,
    joined: "Feb 20, 2024",
  },
  {
    id: 4,
    name: "Michael Wilson",
    email: "michael.w@reader.io",
    initials: "MW",
    avatarColor: "bg-gradient-to-br from-amber-500 to-orange-600",
    role: "reader",
    status: "active",
    articles: 0,
    joined: "Mar 5, 2024",
  },
  {
    id: 5,
    name: "Lisa Wang",
    email: "lisa.wang@superblog.dev",
    initials: "LW",
    avatarColor: "bg-gradient-to-br from-cyan-500 to-sky-600",
    role: "author",
    status: "active",
    articles: 23,
    joined: "Apr 12, 2024",
  },
  {
    id: 6,
    name: "David Kim",
    email: "david.k@reader.io",
    initials: "DK",
    avatarColor: "bg-gradient-to-br from-slate-500 to-gray-600",
    role: "reader",
    status: "inactive",
    articles: 0,
    joined: "May 18, 2024",
  },
];

const roleVariant = {
  admin: "destructive" as const,
  author: "primary" as const,
  reader: "secondary" as const,
};

const roleLabel = {
  admin: "Administrator",
  author: "Author",
  reader: "Reader",
};

export default function UsersPage() {
  const [users, setUsers] = React.useState<User[]>(usersData);
  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set());
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<User | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        searchQuery === "" ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const allSelected =
    filteredUsers.length > 0 &&
    filteredUsers.every((u) => selectedIds.has(u.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredUsers.forEach((u) => next.delete(u.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredUsers.forEach((u) => next.add(u.id));
        return next;
      });
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(userToDelete.id);
        return next;
      });
    }
    setDeleteModalOpen(false);
    setUserToDelete(null);
  };

  return (
    <div>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="mb-2 font-serif text-3xl font-semibold text-foreground">
            Users
          </h1>
          <p className="text-muted">
            Manage your blog authors, editors, and subscribers.
          </p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.1,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="mb-6 flex flex-wrap items-center gap-3"
      >
        <InputWrapper className="w-64">
          <InputIcon>
            <Search className="h-4 w-4" />
          </InputIcon>
          <Input
            variant="search"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputWrapper>

        <Select
          value={roleFilter}
          onValueChange={(value) => setRoleFilter(value || "all")}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Administrator</SelectItem>
            <SelectItem value="author">Author</SelectItem>
            <SelectItem value="reader">Reader</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value || "all")}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.2,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="w-32">Role</TableHead>
                  <TableHead className="w-32">Status</TableHead>
                  <TableHead className="w-24">Articles</TableHead>
                  <TableHead className="w-32">Joined</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className={cn(
                      "h-16",
                      selectedIds.has(user.id) && "bg-primary/5"
                    )}
                  >
                    <TableCell className="w-10">
                      <Checkbox
                        checked={selectedIds.has(user.id)}
                        onCheckedChange={() => toggleSelect(user.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-semibold text-white",
                            user.avatarColor
                          )}
                        >
                          {user.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {user.name}
                          </p>
                          <p className="truncate text-xs text-muted">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="w-32">
                      <Badge variant={roleVariant[user.role]}>
                        {roleLabel[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell className="w-32">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            user.status === "active"
                              ? "bg-primary"
                              : "bg-destructive"
                          )}
                        />
                        <span className="text-sm text-muted capitalize">
                          {user.status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="w-24">
                      <span className="text-sm text-muted">{user.articles}</span>
                    </TableCell>
                    <TableCell className="w-32">
                      <span className="text-sm text-muted">{user.joined}</span>
                    </TableCell>
                    <TableCell className="w-24">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className={`
                            text-muted
                            hover:text-foreground
                          `}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className={`
                            text-muted
                            hover:text-destructive
                          `}
                          onClick={() => handleDelete(user)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pagination */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-6 flex items-center justify-between"
      >
        <p className="text-sm text-muted">
          Showing <strong>1-{filteredUsers.length}</strong> of{" "}
          <strong>{filteredUsers.length}</strong> users
        </p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink isActive>1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink>2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink>3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink>5</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <Trash2 className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {userToDelete && (
            <div className="rounded-lg bg-secondary p-3">
              <p className="font-medium text-foreground">
                &quot;{userToDelete.name}&quot;
              </p>
              <p className="text-sm text-muted">{userToDelete.email}</p>
            </div>
          )}
          <DialogFooter className={`
            gap-2
            sm:gap-0
          `}>
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
