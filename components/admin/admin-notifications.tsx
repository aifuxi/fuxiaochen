"use client";

import { Bell, FileCheck2, MessageCircle, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

import type { Notice } from "./mock-data";

const noticeIcons = { comment: MessageCircle, publication: FileCheck2, backup: ShieldCheck };

type Props = {
  notices: Notice[];
  onRead: (id: string) => void;
  onReadAll: () => void;
};

export function AdminNotifications({ notices, onRead, onReadAll }: Props) {
  const unreadCount = notices.filter((notice) => !notice.read).length;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            size="compact"
            variant="ghost"
            className="admin-icon-button admin-notification-trigger"
          />
        }
        aria-label={`系统通知，${unreadCount} 条未读`}
      >
        <Bell size={18} aria-hidden="true" />
        {unreadCount > 0 && <span className="admin-notification-dot" aria-hidden="true" />}
      </PopoverTrigger>
      <PopoverContent className="admin-notifications">
        <div className="admin-notifications-heading">
          <PopoverTitle>系统通知</PopoverTitle>
          <Button size="compact" variant="ghost" disabled={unreadCount === 0} onClick={onReadAll}>
            全部已读
          </Button>
        </div>
        <ul className="admin-notifications-list" aria-label="通知列表">
          {notices.map((notice) => {
            const Icon = noticeIcons[notice.kind];
            return (
              <li key={notice.id}>
                <Button
                  type="button"
                  variant="ghost"
                  className="admin-notification-row"
                  onClick={() => onRead(notice.id)}
                >
                  <span className="admin-notification-icon" aria-hidden="true">
                    <Icon size={20} strokeWidth={1.8} />
                  </span>
                  <span className="admin-notification-copy">
                    <span className="admin-notification-title">{notice.title}</span>
                    <span className="admin-notification-detail">{notice.detail}</span>
                    <span className="admin-notification-time">
                      {notice.time}
                      <span className="sr-only">
                        {" "}
                        · {notice.read ? "已读" : "未读，点击标为已读"}
                      </span>
                    </span>
                  </span>
                  {!notice.read && <span className="admin-notification-dot" aria-hidden="true" />}
                </Button>
              </li>
            );
          })}
          {notices.length === 0 && <li className="admin-notifications-empty">暂无通知</li>}
        </ul>
        <PopoverDescription className="admin-notifications-footnote">
          演示通知，非实际系统消息。
        </PopoverDescription>
      </PopoverContent>
    </Popover>
  );
}
