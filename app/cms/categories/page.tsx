"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
  articles: number;
}

const colorPresets = [
  "#10b981",
  "#6366f1",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];

export default function CategoriesPage() {
  const [categories, setCategories] = React.useState<Category[]>([
    { id: 1, name: "Design", slug: "design", color: "#10b981", articles: 12 },
    {
      id: 2,
      name: "Technology",
      slug: "technology",
      color: "#6366f1",
      articles: 18,
    },
    { id: 3, name: "Lifestyle", slug: "lifestyle", color: "#f59e0b", articles: 8 },
    { id: 4, name: "Business", slug: "business", color: "#8b5cf6", articles: 4 },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(
    null
  );
  const [deletingCategory, setDeletingCategory] = React.useState<Category | null>(
    null
  );

  const [formName, setFormName] = React.useState("");
  const [formSlug, setFormSlug] = React.useState("");
  const [formColor, setFormColor] = React.useState("#10b981");

  const openAddModal = () => {
    setEditingCategory(null);
    setFormName("");
    setFormSlug("");
    setFormColor("#10b981");
    setIsAddModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormName(category.name);
    setFormSlug(category.slug);
    setFormColor(category.color);
    setIsAddModalOpen(true);
  };

  const openDeleteModal = (category: Category) => {
    setDeletingCategory(category);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingCategory(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingCategory(null);
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

    if (editingCategory) {
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === editingCategory.id
            ? { ...cat, name: formName, slug: formSlug, color: formColor }
            : cat
        )
      );
    } else {
      setCategories((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: formName,
          slug: formSlug,
          color: formColor,
          articles: 0,
        },
      ]);
    }

    closeModal();
  };

  const handleDelete = () => {
    if (deletingCategory) {
      setCategories((prev) => prev.filter((cat) => cat.id !== deletingCategory.id));
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
            Categories
          </h1>
          <p className="text-muted">Organize your articles into categories</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </motion.div>

      {/* Search and Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.1,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <Card className="p-0">
          {/* Search Bar */}
          <div className="border-b border-border p-4">
            <div className="relative max-w-sm">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                type="search"
                placeholder="Search categories..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-40">Slug</TableHead>
                <TableHead className="w-24">Articles</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="rounded-md bg-secondary px-2 py-1 text-xs text-muted">
                      {category.slug}
                    </code>
                  </TableCell>
                  <TableCell>{category.articles}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEditModal(category)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openDeleteModal(category)}
                        className={`
                          text-destructive
                          hover:text-destructive
                        `}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted">
            Showing <strong>1-{categories.length}</strong> of{" "}
            <strong>{categories.length}</strong> categories
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
              1
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Add/Edit Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            {/* Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Technology"
                value={formName}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>

            {/* Slug */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                placeholder="e.g., technology"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
              />
              <p className="text-xs text-muted">URL-friendly version of the name</p>
            </div>

            {/* Color */}
            <div className="flex flex-col gap-2">
              <Label>Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formColor}
                  onChange={(e) => setFormColor(e.target.value)}
                  className="h-12 w-12 cursor-pointer rounded-lg border border-border bg-transparent p-1"
                />
                <div className="flex items-center gap-2">
                  {colorPresets.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormColor(color)}
                      className={cn(
                        "h-7 w-7 rounded-full transition-transform",
                        "hover:scale-110",
                        formColor === color &&
                          "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-muted">
              Are you sure you want to delete this category? Articles in this
              category will become uncategorized.
            </p>
            {deletingCategory && (
              <p className="mt-3 font-medium">{deletingCategory.name}</p>
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
