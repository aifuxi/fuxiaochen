"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Search, Bell, Mail, ChevronDown, Menu } from "lucide-react"
import { Input, InputWrapper, InputIcon } from "@/components/ui/input"

interface HeaderProps {
  className?: string
  onMenuClick?: () => void
}

export function Header({ className, onMenuClick }: HeaderProps) {
  return (
    <header
      className={cn(
        `
          fixed top-0 right-0 left-[260px] z-80 flex h-[72px] items-center justify-between border-b border-border
          bg-background/80 px-6 backdrop-blur-xl
        `,
        className
      )}
    >
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className={`
            hidden rounded-lg p-2 text-muted transition-colors
            hover:bg-secondary hover:text-foreground
            max-lg:flex
          `}
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Search Box */}
        <div className="relative">
          <InputWrapper className={`
            flex min-w-[280px] items-center gap-3 rounded-lg border border-border bg-secondary px-4 py-2
          `}>
            <InputIcon>
              <Search className="h-5 w-5" />
            </InputIcon>
            <Input
              variant="search"
              placeholder="Search articles, users..."
              className="flex-1"
            />
          </InputWrapper>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className={`
          relative rounded-lg p-2 text-muted transition-colors
          hover:bg-secondary hover:text-foreground
        `}>
          <Bell className="h-5 w-5" />
          <span className={`
            absolute top-1 right-1 flex h-4 w-4 animate-pulse items-center justify-center rounded-full bg-primary
            text-[10px] font-semibold text-primary-foreground
          `}>
            3
          </span>
        </button>

        {/* Messages */}
        <button className={`
          rounded-lg p-2 text-muted transition-colors
          hover:bg-secondary hover:text-foreground
        `}>
          <Mail className="h-5 w-5" />
        </button>

        {/* User Dropdown */}
        <button className={`
          flex items-center gap-2 rounded-lg p-1.5 pr-3 transition-colors
          hover:bg-secondary
        `}>
          <div className={`
            flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground
          `}>
            SC
          </div>
          <ChevronDown className="h-4 w-4 text-muted" />
        </button>
      </div>
    </header>
  )
}
