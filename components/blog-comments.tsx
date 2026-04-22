"use client";

import { useState } from "react";

import { MessageSquare, Send, User } from "lucide-react";
import useSWR from "swr";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { apiRequest, buildApiUrl, fetchApiData } from "@/lib/api/fetcher";
import type { PublicComment } from "@/lib/server/comments/mappers";

interface BlogCommentsProps {
  postSlug: string;
}

export function BlogComments({ postSlug }: BlogCommentsProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const commentsUrl = buildApiUrl("/api/public/comments", {
    postSlug,
  });
  const { data, mutate } = useSWR<{ items: PublicComment[] }>(
    commentsUrl,
    fetchApiData,
    {
      revalidateOnFocus: false,
    },
  );

  const comments = data?.items ?? [];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !content.trim()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await apiRequest("/api/public/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postSlug,
          author: name.trim(),
          email: email.trim(),
          content: content.trim(),
        }),
      });

      setSubmitted(true);
      setName("");
      setEmail("");
      setContent("");
      await mutate();
      window.setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to submit comment.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="border-border border-t pt-12">
      <div className="mb-8 flex items-center gap-3">
        <MessageSquare className="text-foreground size-5" />
        <h2 className="text-foreground text-xl font-semibold">
          Comments ({comments.length})
        </h2>
      </div>

      <div className="border-border bg-card mb-10 rounded-lg border p-6">
        <h3 className="text-foreground mb-4 font-medium">Leave a Comment</h3>

        {submitted ? (
          <div className="bg-primary/10 text-primary rounded-lg p-4 text-sm">
            Thank you for your comment! It will appear after moderation.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="text-muted-foreground mb-1.5 block text-sm"
                >
                  Name
                </label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="text-muted-foreground mb-1.5 block text-sm"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="comment"
                className="text-muted-foreground mb-1.5 block text-sm"
              >
                Comment
              </label>
              <Textarea
                id="comment"
                placeholder="Share your thoughts..."
                rows={4}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                required
              />
            </div>
            {submitError ? (
              <p className="text-destructive text-sm">{submitError}</p>
            ) : null}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="mr-2 size-4" />
                  Post Comment
                </>
              )}
            </Button>
          </form>
        )}
      </div>

      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </section>
  );
}

function CommentCard({ comment }: { comment: PublicComment }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0">
        {comment.avatar ? (
          <img
            src={comment.avatar}
            alt={comment.author}
            className="size-10 rounded-full object-cover"
          />
        ) : (
          <div className="bg-muted flex size-10 items-center justify-center rounded-full">
            <User className="text-muted-foreground size-5" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-foreground font-medium">{comment.author}</span>
          <span className="text-muted-foreground text-sm">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="text-muted-foreground">{comment.content}</p>
      </div>
    </div>
  );
}
