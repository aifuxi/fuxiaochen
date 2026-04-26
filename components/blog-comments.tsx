"use client";

import { useEffect, useRef, useState } from "react";

import { MessageSquare, Send, User } from "lucide-react";
import useSWR from "swr";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { apiRequest, buildApiUrl, fetchApiData } from "@/lib/api/fetcher";
import { authClient } from "@/lib/auth-client";
import type { PublicComment } from "@/lib/server/comments/mappers";

import { siteCopy } from "@/constants/site-copy";

interface BlogCommentsProps {
  postSlug: string;
}

const MAX_COMMENT_DEPTH = 3;

const countComments = (comments: PublicComment[]): number =>
  comments.reduce(
    (total, comment) => total + 1 + countComments(comment.replies),
    0,
  );

export function BlogComments({ postSlug }: BlogCommentsProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replySubmittedId, setReplySubmittedId] = useState<string | null>(null);
  const [website, setWebsite] = useState("");
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replySubmittingId, setReplySubmittingId] = useState<string | null>(
    null,
  );
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [replyError, setReplyError] = useState<string | null>(null);
  const hasEditedName = useRef(false);
  const hasEditedEmail = useRef(false);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (!session?.user) {
      return;
    }

    if (!hasEditedName.current && session.user.name) {
      setName(session.user.name);
    }

    if (!hasEditedEmail.current && session.user.email) {
      setEmail(session.user.email);
    }
  }, [session]);

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
  const visibleCommentCount = countComments(comments);
  const resetSubmissionClock = () => setStartedAt(Date.now());

  const submitComment = async ({
    commentContent,
    parentId,
  }: {
    commentContent: string;
    parentId?: string;
  }) => {
    await apiRequest("/api/public/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        postSlug,
        author: name.trim(),
        email: email.trim(),
        content: commentContent.trim(),
        parentId,
        website,
        startedAt,
      }),
      toastOnError: false,
    });
  };

  const handleNameChange = (value: string) => {
    hasEditedName.current = true;
    setName(value);
  };

  const handleEmailChange = (value: string) => {
    hasEditedEmail.current = true;
    setEmail(value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !content.trim()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitComment({
        commentContent: content,
      });

      setSubmitted(true);
      setContent("");
      setWebsite("");
      resetSubmissionClock();
      await mutate();
      window.setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : siteCopy.comments.submitError,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = async (
    event: React.FormEvent<HTMLFormElement>,
    parentId: string,
  ) => {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !replyContent.trim()) {
      return;
    }

    setReplySubmittingId(parentId);
    setReplyError(null);

    try {
      await submitComment({
        commentContent: replyContent,
        parentId,
      });

      setReplyContent("");
      setWebsite("");
      resetSubmissionClock();
      setReplyingToId(null);
      setReplySubmittedId(parentId);
      await mutate();
      window.setTimeout(() => setReplySubmittedId(null), 5000);
    } catch (error) {
      setReplyError(
        error instanceof Error ? error.message : siteCopy.comments.submitError,
      );
    } finally {
      setReplySubmittingId(null);
    }
  };

  const openReplyForm = (commentId: string) => {
    setReplyingToId((current) => (current === commentId ? null : commentId));
    setReplyContent("");
    setReplyError(null);
    setReplySubmittedId(null);
  };

  return (
    <section className="border-t border-border pt-12">
      <div className="mb-8 flex items-center gap-3">
        <MessageSquare className="size-5 text-foreground" />
        <h2 className="text-xl font-semibold text-foreground">
          {siteCopy.comments.title(visibleCommentCount)}
        </h2>
      </div>

      <div className="mb-10 rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 font-medium text-foreground">
          {siteCopy.comments.formTitle}
        </h3>

        {submitted ? (
          <div className="rounded-lg bg-primary/10 p-4 text-sm text-primary">
            {siteCopy.comments.success}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <CommentIdentityFields
              email={email}
              name={name}
              onEmailChange={handleEmailChange}
              onNameChange={handleNameChange}
            />
            <CommentHoneypotField value={website} onChange={setWebsite} />
            <div>
              <label
                htmlFor="comment"
                className="mb-1.5 block text-sm text-muted-foreground"
              >
                {siteCopy.comments.content}
              </label>
              <Textarea
                id="comment"
                placeholder={siteCopy.comments.contentPlaceholder}
                rows={4}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                required
              />
            </div>
            {submitError ? (
              <p className="text-sm text-destructive">{submitError}</p>
            ) : null}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                siteCopy.comments.submitLoading
              ) : (
                <>
                  <Send className="mr-2 size-4" />
                  {siteCopy.comments.submitAction}
                </>
              )}
            </Button>
          </form>
        )}
      </div>

      <div className="space-y-6 pb-16">
        {comments.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            {siteCopy.comments.empty}
          </p>
        ) : (
          comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              depth={1}
              email={email}
              name={name}
              onEmailChange={handleEmailChange}
              onNameChange={handleNameChange}
              onReply={openReplyForm}
              onReplySubmit={handleReplySubmit}
              replyContent={replyContent}
              replyError={replyError}
              replyingToId={replyingToId}
              replySubmittedId={replySubmittedId}
              replySubmittingId={replySubmittingId}
              website={website}
              setWebsite={setWebsite}
              setReplyContent={setReplyContent}
            />
          ))
        )}
      </div>
    </section>
  );
}

function CommentHoneypotField({
  onChange,
  prefix = "comment",
  value,
}: {
  onChange: (value: string) => void;
  prefix?: string;
  value: string;
}) {
  const id = `${prefix}-website`;

  return (
    <div className="hidden" aria-hidden="true">
      <label htmlFor={id}>Website</label>
      <input
        id={id}
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function CommentIdentityFields({
  email,
  name,
  onEmailChange,
  onNameChange,
  prefix,
}: {
  email: string;
  name: string;
  onEmailChange: (value: string) => void;
  onNameChange: (value: string) => void;
  prefix?: string;
}) {
  const nameId = prefix ? `${prefix}-name` : "name";
  const emailId = prefix ? `${prefix}-email` : "email";

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label
          htmlFor={nameId}
          className="mb-1.5 block text-sm text-muted-foreground"
        >
          {siteCopy.comments.name}
        </label>
        <Input
          id={nameId}
          placeholder={siteCopy.comments.namePlaceholder}
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          required
        />
      </div>
      <div>
        <label
          htmlFor={emailId}
          className="mb-1.5 block text-sm text-muted-foreground"
        >
          {siteCopy.comments.email}
        </label>
        <Input
          id={emailId}
          type="email"
          placeholder={siteCopy.comments.emailPlaceholder}
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          required
        />
      </div>
    </div>
  );
}

function CommentCard({
  comment,
  depth,
  email,
  name,
  onEmailChange,
  onNameChange,
  onReply,
  onReplySubmit,
  replyContent,
  replyError,
  replyingToId,
  replySubmittedId,
  replySubmittingId,
  website,
  setWebsite,
  setReplyContent,
}: {
  comment: PublicComment;
  depth: number;
  email: string;
  name: string;
  onEmailChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onReply: (commentId: string) => void;
  onReplySubmit: (
    event: React.FormEvent<HTMLFormElement>,
    parentId: string,
  ) => void;
  replyContent: string;
  replyError: string | null;
  replyingToId: string | null;
  replySubmittedId: string | null;
  replySubmittingId: string | null;
  website: string;
  setWebsite: (value: string) => void;
  setReplyContent: (value: string) => void;
}) {
  const canReply = depth < MAX_COMMENT_DEPTH;
  const isReplying = replyingToId === comment.id;
  const isSubmittingReply = replySubmittingId === comment.id;

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
          <div className="flex size-10 items-center justify-center rounded-full bg-muted">
            <User className="size-5 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="font-medium text-foreground">{comment.author}</span>
          <span className="text-sm text-muted-foreground">
            {new Date(comment.createdAt).toLocaleDateString("zh-CN")}
          </span>
        </div>
        <p className="whitespace-pre-wrap text-muted-foreground">
          {comment.content}
        </p>

        <div className="mt-3 flex items-center gap-3">
          {canReply ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground"
              onClick={() => onReply(comment.id)}
            >
              {isReplying
                ? siteCopy.comments.replyCancel
                : siteCopy.comments.replyAction}
            </Button>
          ) : null}
          {replySubmittedId === comment.id ? (
            <span className="text-sm text-primary">
              {siteCopy.comments.success}
            </span>
          ) : null}
        </div>

        {isReplying ? (
          <form
            onSubmit={(event) => onReplySubmit(event, comment.id)}
            className="mt-4 space-y-4 rounded-lg border border-border bg-card p-4"
          >
            <h3 className="text-sm font-medium text-foreground">
              {siteCopy.comments.replyTitle(comment.author)}
            </h3>
            <CommentIdentityFields
              email={email}
              name={name}
              onEmailChange={onEmailChange}
              onNameChange={onNameChange}
              prefix={`reply-${comment.id}`}
            />
            <CommentHoneypotField
              prefix={`reply-${comment.id}`}
              value={website}
              onChange={setWebsite}
            />
            <div>
              <label
                htmlFor={`reply-content-${comment.id}`}
                className="mb-1.5 block text-sm text-muted-foreground"
              >
                {siteCopy.comments.content}
              </label>
              <Textarea
                id={`reply-content-${comment.id}`}
                placeholder={siteCopy.comments.replyPlaceholder}
                rows={3}
                value={replyContent}
                onChange={(event) => setReplyContent(event.target.value)}
                required
              />
            </div>
            {replyError ? (
              <p className="text-sm text-destructive">{replyError}</p>
            ) : null}
            <Button type="submit" disabled={isSubmittingReply}>
              {isSubmittingReply ? (
                siteCopy.comments.submitLoading
              ) : (
                <>
                  <Send className="mr-2 size-4" />
                  {siteCopy.comments.replyAction}
                </>
              )}
            </Button>
          </form>
        ) : null}

        {comment.replies.length > 0 ? (
          <div className="mt-5 space-y-5 border-l border-border pl-4">
            {comment.replies.map((reply) => (
              <CommentCard
                key={reply.id}
                comment={reply}
                depth={depth + 1}
                email={email}
                name={name}
                onEmailChange={onEmailChange}
                onNameChange={onNameChange}
                onReply={onReply}
                onReplySubmit={onReplySubmit}
                replyContent={replyContent}
                replyError={replyError}
                replyingToId={replyingToId}
                replySubmittedId={replySubmittedId}
                replySubmittingId={replySubmittingId}
                website={website}
                setWebsite={setWebsite}
                setReplyContent={setReplyContent}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
