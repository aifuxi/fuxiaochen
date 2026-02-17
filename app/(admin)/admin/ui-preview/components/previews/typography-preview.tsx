"use client";

import { Title } from "@/components/ui/typography/title";
import { Text } from "@/components/ui/typography/text";
import { Paragraph } from "@/components/ui/typography/paragraph";
import { Link } from "@/components/ui/typography/link";
import { PreviewCard } from "../preview-card";

export function TypographyPreview() {
  return (
    <>
      <PreviewCard title="Title Levels">
        <div className="space-y-2">
          <Title level={1}>Heading 1</Title>
          <Title level={2}>Heading 2</Title>
          <Title level={3}>Heading 3</Title>
          <Title level={4}>Heading 4</Title>
          <Title level={5}>Heading 5</Title>
          <Title level={6}>Heading 6</Title>
        </div>
      </PreviewCard>

      <PreviewCard title="Text Types">
        <Text type="primary">Primary text</Text>
        <Text type="secondary">Secondary text</Text>
        <Text type="success">Success text</Text>
        <Text type="warning">Warning text</Text>
        <Text type="danger">Danger text</Text>
      </PreviewCard>

      <PreviewCard title="Text Sizes">
        <Text size="sm">Small text</Text>
        <Text size="base">Base text</Text>
        <Text size="lg">Large text</Text>
      </PreviewCard>

      <PreviewCard title="Text Weights">
        <Text weight="normal">Normal weight</Text>
        <Text weight="medium">Medium weight</Text>
        <Text weight="semibold">Semibold weight</Text>
        <Text weight="bold">Bold weight</Text>
      </PreviewCard>

      <PreviewCard title="Paragraph">
        <Paragraph type="primary">
          This is a primary paragraph. It provides a way to display longer blocks of text
          with proper line height and spacing.
        </Paragraph>
        <Paragraph type="secondary" size="sm">
          This is a secondary small paragraph. It&apos;s useful for supporting text or
          less prominent content.
        </Paragraph>
      </PreviewCard>

      <PreviewCard title="Link">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="#">Default Link</Link>
          <Link href="#" underline={true}>
            Always Underlined
          </Link>
          <Link href="#" underline={false}>
            No Underline
          </Link>
          <Link href="#" disabled>
            Disabled Link
          </Link>
          <Link href="https://example.com" target="_blank">
            External Link
          </Link>
        </div>
      </PreviewCard>
    </>
  );
}
