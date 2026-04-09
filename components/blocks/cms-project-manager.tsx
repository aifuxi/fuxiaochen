"use client";

import NiceModal from "@ebay/nice-modal-react";
import { ProjectCategory } from "@/generated/prisma/enums";
import { format } from "date-fns";
import { BriefcaseBusiness, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import React from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { toast } from "sonner";

import { ProjectDeleteDialog } from "@/components/modals/project-delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRoot, TableRow } from "@/components/ui/table";
import {
  deleteProject,
  listProjects,
  type ListProjectsResult,
  type ProjectApiError,
} from "@/lib/project/project-client";
import type { ProjectDto } from "@/lib/project/project-dto";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_DELAY = 300;
const CATEGORY_OPTIONS = [
  { label: "All Categories", value: "" },
  { label: "Web", value: ProjectCategory.Web },
  { label: "Design", value: ProjectCategory.Design },
  { label: "Mobile", value: ProjectCategory.Mobile },
  { label: "Open Source", value: ProjectCategory.OpenSource },
];
const FEATURED_OPTIONS = [
  { label: "All Projects", value: "" },
  { label: "Featured", value: "true" },
  { label: "Not Featured", value: "false" },
];

export function CmsProjectManager() {
  const [page, setPage] = React.useState(1);
  const [searchValue, setSearchValue] = React.useState("");
  const [keyword, setKeyword] = React.useState("");
  const [category, setCategory] = React.useState<ProjectCategory | "">("");
  const [featured, setFeatured] = React.useState<"" | "false" | "true">("");

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      setKeyword(searchValue.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_DELAY);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchValue]);

  const query = React.useMemo(
    () => ({
      category: category || undefined,
      isFeatured: featured === "" ? undefined : featured === "true",
      keyword: keyword || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [category, featured, keyword, page],
  );

  const { data, error, isLoading, isValidating, mutate } = useSWR<ListProjectsResult, ProjectApiError>(
    ["projects", query.keyword ?? "", query.category ?? "", String(query.isFeatured ?? ""), query.page, query.pageSize],
    () => listProjects(query),
    {
      keepPreviousData: true,
    },
  );

  const deleteMutation = useSWRMutation(
    "delete-project",
    (_key, { arg }: { arg: { id: string } }) => deleteProject(arg.id),
  );

  const projects = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(data?.totalPages ?? 1, 1);
  const visiblePages = getVisiblePages(page, totalPages);

  React.useEffect(() => {
    if (!data) {
      return;
    }

    if (page > data.totalPages && data.totalPages > 0) {
      setPage(data.totalPages);
    }
  }, [data, page]);

  async function handleDelete(project: ProjectDto) {
    await deleteMutation.trigger({
      id: project.id,
    });
    toast.success(`Deleted ${project.name}.`);

    const nextTotal = Math.max(total - 1, 0);
    const nextTotalPages = Math.max(Math.ceil(nextTotal / PAGE_SIZE), 1);

    if (page > nextTotalPages) {
      setPage(nextTotalPages);

      return;
    }

    await mutate();
  }

  function openDeleteDialog(project: ProjectDto) {
    void NiceModal.show(ProjectDeleteDialog, {
      onConfirm: () => handleDelete(project),
      project,
    });
  }

  return (
    <div className="space-y-6">
      <div className={`
        flex flex-col gap-4
        lg:flex-row lg:items-center lg:justify-between
      `}>
        <div className={`
          flex flex-1 flex-col gap-3
          lg:flex-row lg:items-center
        `}>
          <div className="w-full max-w-md">
            <Input
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search by name, slug, or summary"
              startAdornment={<Search className="size-4" />}
              value={searchValue}
            />
          </div>
          <div className="w-full max-w-56">
            <Select
              onValueChange={(value) => {
                setCategory(value as ProjectCategory | "");
                setPage(1);
              }}
              options={CATEGORY_OPTIONS}
              value={category}
            />
          </div>
          <div className="w-full max-w-56">
            <Select
              onValueChange={(value) => {
                setFeatured(value as "" | "false" | "true");
                setPage(1);
              }}
              options={FEATURED_OPTIONS}
              value={featured}
            />
          </div>
          <div className="flex items-center gap-3 text-sm text-muted">
            <Badge variant="muted">{total} projects</Badge>
            {isValidating && !isLoading ? <span className="inline-flex items-center gap-2"><RefreshCw className={`
              size-3 animate-spin
            `} /> Refreshing</span> : null}
          </div>
        </div>

        <Link href="/cms/project/new">
          <Button variant="primary">
            <Plus className="size-4" />
            New Project
          </Button>
        </Link>
      </div>

      <div className={`
        grid gap-4
        sm:grid-cols-3
      `}>
        <MetricCard label="Total Projects" value={String(total)} />
        <MetricCard label="Visible Projects" value={String(projects.length)} />
        <MetricCard label="Active Filter" value={category || (featured ? "Featured" : "All projects")} />
      </div>

      <Table>
        <TableRoot>
          <TableHead>
            <tr>
              <TableHeaderCell>Project</TableHeaderCell>
              <TableHeaderCell>Category</TableHeaderCell>
              <TableHeaderCell>Technologies</TableHeaderCell>
              <TableHeaderCell>Published</TableHeaderCell>
              <TableHeaderCell>State</TableHeaderCell>
              <TableHeaderCell className="text-right">Actions</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }, (_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={6}>
                    <div className="h-14 animate-pulse rounded-xl bg-white/5" />
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell className="py-10" colSpan={6}>
                  <div className="flex flex-col items-center gap-4 text-center">
                    <p className="max-w-md text-sm text-muted">{error.message || "Failed to load projects."}</p>
                    <Button onClick={() => void mutate()} variant="outline">
                      Retry
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : projects.length === 0 ? (
              <TableRow>
                <TableCell className="py-12" colSpan={6}>
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className={`
                      flex size-12 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-muted
                    `}>
                      <BriefcaseBusiness className="size-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-base text-foreground">
                        {keyword || category || featured ? "No projects match this filter." : "No projects yet."}
                      </p>
                      <p className="text-sm text-muted">
                        {keyword || category || featured
                          ? "Try a different filter combination."
                          : "Create the first project to build the portfolio library."}
                      </p>
                    </div>
                    {!keyword && !category && !featured ? (
                      <Link href="/cms/project/new">
                        <Button variant="outline">
                          <Plus className="size-4" />
                          Create Project
                        </Button>
                      </Link>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-foreground">{project.name}</div>
                      <div className="line-clamp-2 text-xs leading-5 text-muted">
                        {project.summary}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatCategoryLabel(project.category)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {project.techNames.length > 0 ? (
                        project.techNames.slice(0, 3).map((techName) => (
                          <span key={techName} className="rounded-md bg-white/6 px-2 py-1 text-xs text-muted">
                            {techName}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted">No technologies</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted">
                    {project.publishedAt ? format(new Date(project.publishedAt), "yyyy-MM-dd") : "Unpublished"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={project.isFeatured ? "success" : "muted"}>
                        {project.isFeatured ? "Featured" : "Standard"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Link href={`/cms/project/${project.id}`}>
                        <Button size="sm" variant="ghost">Edit</Button>
                      </Link>
                      <Button
                        disabled={deleteMutation.isMutating}
                        onClick={() => openDeleteDialog(project)}
                        size="sm"
                        variant="outline"
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </TableRoot>
      </Table>

      <div className={`
        flex flex-col gap-4
        sm:flex-row sm:items-center sm:justify-between
      `}>
        <p className="text-sm text-muted">
          {total === 0
            ? "No records"
            : `Showing ${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, total)} of ${total}`}
        </p>
        <div className="flex items-center gap-2">
          <Button
            disabled={page === 1 || isLoading}
            onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
            size="sm"
            variant="outline"
          >
            Prev
          </Button>
          {visiblePages.map((item) => (
            <Button
              key={item}
              disabled={isLoading}
              onClick={() => setPage(item)}
              size="sm"
              variant={item === page ? "primary" : "ghost"}
            >
              {item}
            </Button>
          ))}
          <Button
            disabled={page === totalPages || isLoading}
            onClick={() => setPage((currentPage) => Math.min(currentPage + 1, totalPages))}
            size="sm"
            variant="outline"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
      <p className="text-xs tracking-[0.18em] text-muted uppercase">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function formatCategoryLabel(category: ProjectCategory) {
  if (category === ProjectCategory.OpenSource) {
    return "Open Source";
  }

  return category;
}

function getVisiblePages(page: number, totalPages: number) {
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const startPage = Math.max(1, Math.min(page - 2, totalPages - maxVisiblePages + 1));

  return Array.from({ length: maxVisiblePages }, (_, index) => startPage + index);
}
