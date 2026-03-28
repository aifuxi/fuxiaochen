"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check, Reply, User } from "lucide-react"

interface ActivityItemProps {
  avatar: string
  avatarInitials: string
  avatarColor: "john" | "sarah" | "mike"
  content: React.ReactNode
  time: string
  showApprove?: boolean
  showReply?: boolean
  showUser?: boolean
  className?: string
}

const avatarColorClasses = {
  john: "bg-chart-1/15 text-chart-1",
  sarah: "bg-chart-2/15 text-chart-2",
  mike: "bg-chart-3/15 text-chart-3",
}

export function ActivityItem({
  avatar,
  avatarInitials,
  avatarColor,
  content,
  time,
  showApprove = true,
  showReply = true,
  showUser = false,
  className,
}: ActivityItemProps) {
  return (
    <div
      className={cn(
        `
          flex items-start gap-4 p-4 transition-colors
          hover:bg-secondary/50
        `,
        className
      )}
    >
      {avatar ? (
        <img
          src={avatar}
          alt=""
          className="h-10 w-10 rounded-lg object-cover"
        />
      ) : (
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold",
            avatarColorClasses[avatarColor]
          )}
        >
          {avatarInitials}
        </div>
      )}
      <div className="min-w-0 flex-1">
        {content}
        <span className="mt-1 block text-xs text-muted">{time}</span>
      </div>
      <div className="flex items-center gap-1">
        {showApprove && (
          <button
            className={`
              rounded-lg p-2 text-muted transition-colors
              hover:bg-primary/10 hover:text-primary
            `}
            title="Approve"
          >
            <Check className="h-4 w-4" />
          </button>
        )}
        {showReply && (
          <button
            className={`
              rounded-lg p-2 text-muted transition-colors
              hover:bg-secondary hover:text-foreground
            `}
            title="Reply"
          >
            <Reply className="h-4 w-4" />
          </button>
        )}
        {showUser && (
          <button
            className={`
              rounded-lg p-2 text-muted transition-colors
              hover:bg-secondary hover:text-foreground
            `}
            title="View"
          >
            <User className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
