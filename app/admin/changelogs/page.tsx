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
  version: z.string().min(1, "Version is required"),
  content: z.string().min(1, "Content is required"),
  date: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 0)),
});

interface Changelog {
  id: string;
  version: string;
  content: string;
  date: number;
  createdAt: string;
}

export default function ChangelogsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      version: "",
      content: "",
      date: 0 as any,
    },
  });

  const {
    data: list,
    run: fetchList,
    loading,
  } = useRequest(() => api.get<Changelog[]>("/changelogs"), {
    onError: (error) => toast.error(error.message),
  });

  const { run: create, loading: createLoading } = useRequest(
    (data) => api.post("/changelogs", data),
    {
      manual: true,
      onSuccess: () => {
        toast.success("Changelog created successfully");
        setIsOpen(false);
        form.reset();
        fetchList();
      },
    },
  );

  const { run: update, loading: updateLoading } = useRequest(
    (id, data) => api.put(`/changelogs/${id}`, data),
    {
      manual: true,
      onSuccess: () => {
        toast.success("Changelog updated successfully");
        setIsOpen(false);
        setEditingId(null);
        form.reset();
        fetchList();
      },
    },
  );

  const { run: remove } = useRequest((id) => api.delete(`/changelogs/${id}`), {
    manual: true,
    onSuccess: () => {
      toast.success("Changelog deleted successfully");
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

  const handleEdit = (changelog: Changelog) => {
    setEditingId(changelog.id);
    form.reset({
      version: changelog.version,
      content: changelog.content,
      date: String(changelog.date) as any,
    });
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this changelog?")) {
      remove(id);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setEditingId(null);
      form.reset({ version: "", content: "", date: "0" as any });
    }
  };

  return (
    <CyberContainer
      title="CHANGELOGS_DATABASE"
      action={
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button
              className={`
                border border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan
                hover:bg-neon-cyan/20 hover:text-white
              `}
            >
              <Plus className="mr-2 h-4 w-4" /> NEW_CHANGELOG
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
                {editingId ? "EDIT_CHANGELOG" : "CREATE_CHANGELOG"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-400">Version</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="v1.0.0"
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
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-400">
                        Date (YYYYMMDD)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="20230101"
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
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-400">Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What's new..."
                          className={`
                            h-32 border-white/10 bg-white/5 text-gray-200
                            focus:border-neon-cyan/50 focus:ring-neon-cyan/20
                          `}
                          {...field}
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
              Version
            </TableHead>
            <TableHead className="font-display tracking-wider text-neon-cyan uppercase">
              Date
            </TableHead>
            <TableHead className="font-display tracking-wider text-neon-cyan uppercase">
              Content
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
            list?.map((changelog) => (
              <TableRow
                key={changelog.id}
                className={`
                  group border-b border-white/10 transition-colors
                  hover:bg-neon-cyan/5
                  data-[state=selected]:bg-white/5
                `}
              >
                <TableCell
                  className={`
                    font-mono font-medium text-neon-purple transition-colors
                    group-hover:text-neon-cyan
                  `}
                >
                  {changelog.version}
                </TableCell>
                <TableCell className="font-mono text-xs text-gray-500">
                  {changelog.date}
                </TableCell>
                <TableCell className="max-w-md truncate whitespace-pre-wrap text-gray-400">
                  {changelog.content}
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`
                      text-gray-400
                      hover:bg-white/5 hover:text-neon-cyan
                    `}
                    onClick={() => handleEdit(changelog)}
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
                    onClick={() => handleDelete(changelog.id)}
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
