import { BytemdViewer } from "@/components/bytemd";
import { Wrapper } from "@/components/wrapper";

import { TagList } from "@/features/tag";
import { prettyDateWithWeekday } from "@/lib/utils";

import { type Snippet } from "../types";

type SnippetDetailProps = {
  snippet: Snippet;
};

export const SnippetDetailPage = ({ snippet }: SnippetDetailProps) => {
  return (
    <Wrapper className="flex !max-w-prose flex-col pt-8 md:!px-0">
      <h1 className="mb-6 break-all text-4xl font-semibold">{snippet.title}</h1>

      <p className="mb-6 text-neutral-500">{snippet.description}</p>
      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
        <p>发布于&nbsp;&nbsp;{prettyDateWithWeekday(snippet.createdAt)}</p>
      </div>

      <BytemdViewer body={snippet.body || ""} />

      <div className="pb-14 pt-16">
        <TagList tags={snippet.tags} />
      </div>
    </Wrapper>
  );
};
