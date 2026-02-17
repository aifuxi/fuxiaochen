"use client";

import { FileX2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AppleCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PreviewCard } from "../preview-card";

export function DisplayPreview() {
  return (
    <>
      <PreviewCard title="Card">
        <Card className="w-80">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description goes here</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content area with some example text.</p>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button size="sm">Action</Button>
          </CardFooter>
        </Card>
      </PreviewCard>

      <PreviewCard title="AppleCard">
        <AppleCard className="w-64">
          <p className="text-sm text-text-secondary">Default AppleCard</p>
        </AppleCard>
        <AppleCard variant="hover" className="w-64">
          <p className="text-sm text-text-secondary">Hover AppleCard</p>
        </AppleCard>
      </PreviewCard>

      <PreviewCard title="Badge">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="outline">Outline</Badge>
      </PreviewCard>

      <PreviewCard title="Avatar">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <Avatar className="h-12 w-12">
          <AvatarFallback>XL</AvatarFallback>
        </Avatar>
        <Avatar className="h-6 w-6">
          <AvatarFallback>SM</AvatarFallback>
        </Avatar>
      </PreviewCard>

      <PreviewCard title="Skeleton">
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-32 w-64 rounded-lg" />
      </PreviewCard>

      <PreviewCard title="Empty">
        <Empty className="w-64 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileX2 />
            </EmptyMedia>
            <EmptyTitle>No results found</EmptyTitle>
            <EmptyDescription>
              Try adjusting your search or filters.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </PreviewCard>

      <PreviewCard title="Separator">
        <div className="flex w-64 flex-col gap-4">
          <span>Item 1</span>
          <Separator />
          <span>Item 2</span>
        </div>
        <div className="flex h-12 items-center gap-4">
          <span>Left</span>
          <Separator orientation="vertical" />
          <span>Right</span>
        </div>
      </PreviewCard>

      <PreviewCard title="Table">
        <Table className="w-96">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
              <TableCell>
                <Badge>Active</Badge>
              </TableCell>
              <TableCell className="text-right">$250.00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Jane Smith</TableCell>
              <TableCell>
                <Badge variant="secondary">Pending</Badge>
              </TableCell>
              <TableCell className="text-right">$150.00</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </PreviewCard>
    </>
  );
}
