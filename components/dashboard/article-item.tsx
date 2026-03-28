"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Calendar, Eye, Edit2, Trash2 } from "lucide-react"

interface ArticleItemProps {
  image: string
  title: string
  date: string
  views: string
  className?: string
}

export function ArticleItem({
  image,
  title,
  date,
  views,
  className,
}: ArticleItemProps) {
  return (
    <div
      className={cn(
        `
          flex items-center gap-4 p-4 transition-colors
          hover:bg-secondary/50
        `,
        className
      )}
    >
      <img
        src={image}
        alt=""
        className="h-12 w-16 rounded-lg object-cover"
      />
      <div className="min-w-0 flex-1">
        <h3 className="mb-1 truncate text-sm font-medium text-foreground">
          {title}
        </h3>
        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {date}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {views} views
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          className={`
            rounded-lg p-2 text-muted transition-colors
            hover:bg-secondary hover:text-foreground
          `}
          title="Edit"
        >
          <Edit2 className="h-4 w-4" />
        </button>
        <button
          className={`
            rounded-lg p-2 text-muted transition-colors
            hover:bg-destructive/10 hover:text-destructive
          `}
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
