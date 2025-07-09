import { BytemdViewer } from "@/components/bytemd";
import { Wrapper } from "@/components/wrapper";

import { TagList } from "@/features/tag";
import { prettyDateWithWeekday } from "@/lib/common";

import { type Snippet } from "../types";

interface SnippetDetailProps {
  snippet: Snippet;
}

export const SnippetDetailPage = ({ snippet }: SnippetDetailProps) => {
  return (
    <Wrapper className="mx-auto flex max-w-[720px] flex-col pt-8 md:!px-0">
      <h1 className="mb-6 text-4xl font-semibold break-all">{snippet.title}</h1>

      <p className="mb-6 text-neutral-500">{snippet.description}</p>
      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
        <p>发布于&nbsp;&nbsp;{prettyDateWithWeekday(snippet.createdAt)}</p>
      </div>

      <BytemdViewer body={snippet.body || ""} />

      <div className="pt-16 pb-14">
        <TagList tags={snippet.tags} />
      </div>
    </Wrapper>
  );
};
