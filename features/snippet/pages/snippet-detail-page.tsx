import { BytemdViewer } from "@/components/bytemd";

import { TagList } from "@/features/tag";
import { prettyDateWithWeekday } from "@/lib/common";

import { type Snippet } from "../types";

interface SnippetDetailProps {
  snippet: Snippet;
}

export const SnippetDetailPage = ({ snippet }: SnippetDetailProps) => {
  return (
    <div
      className={`
        mx-auto flex max-w-prose-wrapper flex-col pt-8
        md:!px-0
      `}
    >
      <h1 className="mb-6 text-4xl font-semibold break-all">{snippet.title}</h1>

      <p className="mb-6 text-muted-foreground">{snippet.description}</p>
      <div className="mb-6 flex items-center space-x-4 text-sm text-muted-foreground">
        <p>发布于&nbsp;&nbsp;{prettyDateWithWeekday(snippet.createdAt)}</p>
      </div>

      <BytemdViewer body={snippet.body || ""} />

      <div className="pt-16 pb-14">
        <TagList tags={snippet.tags} />
      </div>
    </div>
  );
};
