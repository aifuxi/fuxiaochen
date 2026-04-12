"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";

export function FriendLinkApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const avatarUrl = String(formData.get("avatarUrl") ?? "").trim();

    try {
      const response = await fetch("/api/public/friend-link-applications", {
        body: JSON.stringify({
          avatarUrl: avatarUrl.length > 0 ? avatarUrl : null,
          siteDescription: String(formData.get("siteDescription") ?? ""),
          siteName: String(formData.get("siteName") ?? ""),
          siteUrl: String(formData.get("siteUrl") ?? ""),
        }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json()) as { message?: string; success?: boolean };

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "无法提交申请。");
      }

      event.currentTarget.reset();
      toast.success("友链申请已提交。");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "提交失败，请稍后再试。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className={`
        grid gap-4
        md:grid-cols-2
      `}>
        <div>
          <label className="mb-2 block text-sm font-medium" htmlFor="siteName">网站名称</label>
          <input
            required
            className="form-input w-full rounded-xl px-4 py-3"
            id="siteName"
            name="siteName"
            placeholder="例如：John 的博客"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium" htmlFor="siteUrl">网站地址</label>
          <input
            required
            className="form-input w-full rounded-xl px-4 py-3"
            id="siteUrl"
            name="siteUrl"
            placeholder="https://example.com"
            type="url"
          />
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="siteDescription">网站描述</label>
        <input
          required
          className="form-input w-full rounded-xl px-4 py-3"
          id="siteDescription"
          name="siteDescription"
          placeholder="简要描述您的网站内容"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="avatarUrl">头像链接（可选）</label>
        <input
          className="form-input w-full rounded-xl px-4 py-3"
          id="avatarUrl"
          name="avatarUrl"
          placeholder="https://example.com/avatar.jpg"
          type="url"
        />
      </div>
      <button
        className={`
          btn-primary-glow font-mono-tech rounded-full px-6 py-3 text-sm tracking-wider uppercase
          disabled:opacity-60
        `}
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "提交中..." : "提交申请"}
      </button>
    </form>
  );
}
