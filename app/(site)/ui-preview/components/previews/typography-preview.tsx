"use client";

import { PreviewCard } from "../preview-card";

export function TypographyPreview() {
  return (
    <>
      <PreviewCard title="Title Levels">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Heading 1</h1>
          <h2 className="text-xl font-semibold text-foreground">Heading 2</h2>
          <h3 className="text-lg font-semibold text-foreground">Heading 3</h3>
          <h4 className="text-base font-semibold text-foreground">Heading 4</h4>
          <h5 className="text-sm font-semibold text-foreground">Heading 5</h5>
          <h6 className="text-xs font-semibold text-foreground">Heading 6</h6>
        </div>
      </PreviewCard>

      <PreviewCard title="Text Types">
        <span className="text-sm text-foreground">Primary text</span>
        <span className="text-sm text-muted-foreground">Secondary text</span>
        <span className="text-sm text-muted-foreground">Success text</span>
        <span className="text-sm text-muted-foreground">Warning text</span>
        <span className="text-sm text-destructive">Danger text</span>
      </PreviewCard>

      <PreviewCard title="Text Sizes">
        <span className="text-sm text-foreground">Small text</span>
        <span className="text-base text-foreground">Base text</span>
        <span className="text-lg text-foreground">Large text</span>
      </PreviewCard>

      <PreviewCard title="Text Weights">
        <span className="text-sm font-normal text-foreground">Normal weight</span>
        <span className="text-sm font-medium text-foreground">Medium weight</span>
        <span className="text-sm font-semibold text-foreground">Semibold weight</span>
        <span className="text-sm font-bold text-foreground">Bold weight</span>
      </PreviewCard>

      <PreviewCard title="Paragraph">
        <p className="text-sm leading-relaxed text-foreground">
          This is a primary paragraph. It provides a way to display longer blocks of text
          with proper line height and spacing.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          This is a secondary small paragraph. It&apos;s useful for supporting text or
          less prominent content.
        </p>
      </PreviewCard>

      <PreviewCard title="Link">
        <div className="flex flex-wrap items-center gap-4">
          <a href="#" className={`
            text-primary
            hover:underline
          `}>Default Link</a>
          <a href="#" className="text-primary underline">Always Underlined</a>
          <a href="#" className="text-primary no-underline">No Underline</a>
          <a href="#" className="pointer-events-none cursor-not-allowed text-muted-foreground">Disabled Link</a>
          <a href="https://example.com" target="_blank" className={`
            text-primary
            hover:underline
          `}>External Link</a>
        </div>
      </PreviewCard>
    </>
  );
}
