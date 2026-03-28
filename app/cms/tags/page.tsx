"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Search, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface TagItem {
  id: number;
  name: string;
  slug: string;
  articles: number;
}

export default function TagsPage() {
  const [tags, setTags] = React.useState<TagItem[]>([
    { id: 1, name: "design-systems", slug: "design-systems", articles: 12 },
    { id: 2, name: "react", slug: "react", articles: 18 },
    { id: 3, name: "css", slug: "css", articles: 8 },
    { id: 4, name: "javascript", slug: "javascript", articles: 15 },
    { id: 5, name: "typescript", slug: "typescript", articles: 10 },
    { id: 6, name: "performance", slug: "performance", articles: 6 },
    { id: 7, name: "typography", slug: "typography", articles: 4 },
    { id: 8, name: "ux-design", slug: "ux-design", articles: 9 },
    { id: 9, name: "accessibility", slug: "accessibility", articles: 5 },
    { id: 10, name: "web-dev", slug: "web-dev", articles: 11 },
  ]);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [editingTag, setEditingTag] = React.useState<TagItem | null>(null);
  const [deletingTag, setDeletingTag] = React.useState<TagItem | null>(null);

  const [formName, setFormName] = React.useState("");
  const [formSlug, setFormSlug] = React.useState("");

  const filteredTags = searchQuery
    ? tags.filter((tag) =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tags;

  const openAddModal = () => {
    setEditingTag(null);
    setFormName("");
    setFormSlug("");
    setIsAddModalOpen(true);
  };

  const openEditModal = (tag: TagItem) => {
    setEditingTag(tag);
    setFormName(tag.name);
    setFormSlug(tag.slug);
    setIsAddModalOpen(true);
  };

  const openDeleteModal = (tag: TagItem) => {
    setDeletingTag(tag);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingTag(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingTag(null);
  };

  const handleNameChange = (value: string) => {
    setFormName(value);
    // Auto-generate slug
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
      .replace(/^-|-$/g, "");
    setFormSlug(slug);
  };

  const handleSave = () => {
    if (!formName.trim() || !formSlug.trim()) return;

    if (editingTag) {
      setTags((prev) =>
        prev.map((tag) =>
          tag.id === editingTag.id
            ? { ...tag, name: formSlug, slug: formSlug }
            : tag
        )
      );
    } else {
      setTags((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: formSlug,
          slug: formSlug,
          articles: 0,
        },
      ]);
    }

    closeModal();
  };

  const handleDelete = () => {
    if (deletingTag) {
      setTags((prev) => prev.filter((tag) => tag.id !== deletingTag.id));
      closeDeleteModal();
    }
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
            Tags
          </h1>
          <p className="text-muted">Manage your article tags</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="h-4 w-4" />
          Add Tag
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.1,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="mb-6"
      >
        <div className="relative max-w-sm">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            type="search"
            placeholder="Search tags..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Tags Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.15,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <Card className="p-6">
          <div className={`
            grid grid-cols-1 gap-4
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
          `}>
            {filteredTags.map((tag, index) => (
              <motion.div
                key={tag.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: 0.05 * Math.min(index, 10),
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`
                  group relative rounded-xl border border-border bg-secondary/50 p-5 transition-all duration-200
                  hover:border-border-hover hover:-translate-y-1 hover:bg-secondary
                `}
              >
                <div className="mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  <span className="font-mono text-sm font-semibold text-foreground">
                    {tag.name}
                  </span>
                </div>
                <p className="mb-4 text-xs text-muted">
                  {tag.articles} articles
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(tag)}
                    className="h-7 px-2 text-xs"
                  >
                    <Edit2 className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeleteModal(tag)}
                    className={`
                      h-7 px-2 text-xs text-destructive
                      hover:border-destructive/50 hover:bg-destructive/10
                    `}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredTags.length === 0 && (
            <div className="py-12 text-center">
              <Tag className="mx-auto mb-3 h-10 w-10 text-muted/50" />
              <p className="text-muted">No tags found</p>
            </div>
          )}
        </Card>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted">
            Showing <strong>{filteredTags.length}</strong> tags
          </p>
        </div>
      </motion.div>

      {/* Add/Edit Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTag ? "Edit Tag" : "Add Tag"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            {/* Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., react"
                value={formName}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>

            {/* Slug */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                placeholder="e.g., react"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
              />
              <p className="text-xs text-muted">
                URL-friendly version of the tag name
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Tag</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Tag</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-muted">
              Are you sure you want to delete this tag? This action cannot be
              undone.
            </p>
            {deletingTag && (
              <p className="mt-3 font-medium">#{deletingTag.name}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
