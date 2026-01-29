"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRequest } from "ahooks";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

import { CyberContainer } from "@/components/admin/cyber-container";

import { api } from "@/lib/api-client";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
});

interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
}

export default function TagsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  const {
    data: list,
    run: fetchList,
    loading,
  } = useRequest(() => api.get<Tag[]>("/tags"), {
    onError: (error) => toast.error(error.message),
  });

  const { run: create, loading: createLoading } = useRequest(
    (data) => api.post("/tags", data),
    {
      manual: true,
      onSuccess: () => {
        toast.success("Tag created successfully");
        setIsOpen(false);
        form.reset();
        fetchList();
      },
    },
  );

  const { run: update, loading: updateLoading } = useRequest(
    (id, data) => api.put(`/tags/${id}`, data),
    {
      manual: true,
      onSuccess: () => {
        toast.success("Tag updated successfully");
        setIsOpen(false);
        setEditingId(null);
        form.reset();
        fetchList();
      },
    },
  );

  const { run: remove } = useRequest((id) => api.delete(`/tags/${id}`), {
    manual: true,
    onSuccess: () => {
      toast.success("Tag deleted successfully");
      fetchList();
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editingId) {
      update(editingId, values);
    } else {
      create(values);
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditingId(tag.id);
    form.reset({
      name: tag.name,
      slug: tag.slug,
      description: tag.description || "",
    });
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this tag?")) {
      remove(id);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setEditingId(null);
      form.reset({ name: "", slug: "", description: "" });
    }
  };

  return (
    <CyberContainer
      title="TAGS_DATABASE"
      action={
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button
              className={`
                border border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan
                hover:bg-neon-cyan/20 hover:text-white
              `}
            >
              <Plus className="mr-2 h-4 w-4" /> NEW_TAG
            </Button>
          </DialogTrigger>
          <DialogContent
            className={`
              border-white/10 bg-black/90 backdrop-blur-xl
              sm:max-w-[425px]
            `}
          >
            <DialogHeader>
              <DialogTitle className="font-display text-xl tracking-wider text-neon-cyan">
                {editingId ? "EDIT_TAG" : "CREATE_TAG"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-400">Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Tag Name"
                          {...field}
                          className={`
                            border-white/10 bg-white/5 text-gray-200
                            focus:border-neon-cyan/50 focus:ring-neon-cyan/20
                          `}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-400">Slug</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="tag-slug"
                          {...field}
                          className={`
                            border-white/10 bg-white/5 text-gray-200
                            focus:border-neon-cyan/50 focus:ring-neon-cyan/20
                          `}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-400">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Description"
                          {...field}
                          className={`
                            border-white/10 bg-white/5 text-gray-200
                            focus:border-neon-cyan/50 focus:ring-neon-cyan/20
                          `}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className={`
                    w-full bg-neon-cyan font-bold text-black
                    hover:bg-neon-cyan/80
                  `}
                  disabled={createLoading || updateLoading}
                >
                  {editingId ? "UPDATE" : "CREATE"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      }
    >
      <Table>
        <TableHeader className="bg-white/5">
          <TableRow
            className={`
              border-b border-white/10
              hover:bg-transparent
            `}
          >
            <TableHead className="font-display tracking-wider text-neon-cyan uppercase">
              Name
            </TableHead>
            <TableHead className="font-display tracking-wider text-neon-cyan uppercase">
              Slug
            </TableHead>
            <TableHead className="font-display tracking-wider text-neon-cyan uppercase">
              Description
            </TableHead>
            <TableHead className="text-right font-display tracking-wider text-neon-cyan uppercase">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="py-10 text-center font-mono text-gray-500"
              >
                INITIALIZING...
              </TableCell>
            </TableRow>
          ) : list?.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="py-10 text-center font-mono text-gray-500"
              >
                NO_DATA_FOUND
              </TableCell>
            </TableRow>
          ) : (
            list?.map((tag) => (
              <TableRow
                key={tag.id}
                className={`
                  group border-b border-white/10 transition-colors
                  hover:bg-neon-cyan/5
                  data-[state=selected]:bg-white/5
                `}
              >
                <TableCell
                  className={`
                    font-medium text-gray-200 transition-colors
                    group-hover:text-neon-cyan
                  `}
                >
                  {tag.name}
                </TableCell>
                <TableCell
                  className={`
                    font-mono text-xs text-gray-500
                    group-hover:text-gray-400
                  `}
                >
                  {tag.slug}
                </TableCell>
                <TableCell className="text-sm text-gray-400">
                  {tag.description}
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`
                      text-gray-400
                      hover:bg-white/5 hover:text-neon-cyan
                    `}
                    onClick={() => handleEdit(tag)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`
                      text-gray-400
                      hover:bg-white/5 hover:text-red-500
                    `}
                    onClick={() => handleDelete(tag.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </CyberContainer>
  );
}
