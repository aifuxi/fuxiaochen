"use client";

import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group";
import { Toggle } from "@/components/ui/toggle";
import { PreviewCard } from "../preview-card";

export function ButtonPreview() {
  return (
    <>
      <PreviewCard title="Button Variants">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="destructive">Destructive</Button>
      </PreviewCard>

      <PreviewCard title="Button Sizes">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
      </PreviewCard>

      <PreviewCard title="Button with Icon">
        <Button>
          <Mail className="h-4 w-4" />
          Send Email
        </Button>
        <Button size="icon">
          <Mail className="h-4 w-4" />
        </Button>
      </PreviewCard>

      <PreviewCard title="Button Disabled">
        <Button disabled>Disabled</Button>
      </PreviewCard>

      <PreviewCard title="ButtonGroup">
        <ButtonGroup>
          <Button variant="secondary">Left</Button>
          <Button variant="secondary">Center</Button>
          <Button variant="secondary">Right</Button>
        </ButtonGroup>
      </PreviewCard>

      <PreviewCard title="ButtonGroup with Separator">
        <ButtonGroup>
          <Button variant="secondary">Save</Button>
          <ButtonGroupSeparator />
          <Button variant="secondary">Export</Button>
        </ButtonGroup>
      </PreviewCard>

      <PreviewCard title="ButtonGroup Vertical">
        <ButtonGroup orientation="vertical">
          <Button variant="secondary">Top</Button>
          <Button variant="secondary">Middle</Button>
          <Button variant="secondary">Bottom</Button>
        </ButtonGroup>
      </PreviewCard>

      <PreviewCard title="Toggle">
        <Toggle>Default</Toggle>
        <Toggle variant="outline">Outline</Toggle>
      </PreviewCard>

      <PreviewCard title="Toggle Sizes">
        <Toggle size="sm">Small</Toggle>
        <Toggle size="default">Default</Toggle>
        <Toggle size="lg">Large</Toggle>
      </PreviewCard>
    </>
  );
}
