"use client";

import { useState } from "react";

import { MessageSquare, Send, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { getCommentsByPostSlug, type Comment } from "@/lib/comments-data";

interface BlogCommentsProps {
  postSlug: string;
}

export function BlogComments({ postSlug }: BlogCommentsProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const comments = getCommentsByPostSlug(postSlug);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !content.trim()) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setSubmitted(true);
    setName("");
    setEmail("");
    setContent("");

    // Reset success message after 5 seconds
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section className="border-border border-t pt-12">
      <div className="mb-8 flex items-center gap-3">
        <MessageSquare className="text-foreground size-5" />
        <h2 className="text-foreground text-xl font-semibold">
          Comments ({comments.length})
        </h2>
      </div>

      {/* Comment Form */}
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
                  onChange={(e) => setName(e.target.value)}
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
                  onChange={(e) => setEmail(e.target.value)}
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
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
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

      {/* Comments List */}
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

function CommentCard({ comment }: { comment: Comment }) {
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
            {comment.createdAt}
          </span>
        </div>
        <p className="text-muted-foreground">{comment.content}</p>
      </div>
    </div>
  );
}
