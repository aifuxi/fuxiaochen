import { Title } from "@/components/ui/typography/title";
import { Text } from "@/components/ui/typography/text";
import { SectionWrapper } from "./components/section-wrapper";
import { ButtonPreview } from "./components/previews/button-preview";
import { InputPreview } from "./components/previews/input-preview";
import { DisplayPreview } from "./components/previews/display-preview";
import { DialogPreview } from "./components/previews/dialog-preview";
import { TypographyPreview } from "./components/previews/typography-preview";
import { FormPreview } from "./components/previews/form-preview";
import { LayoutPreview } from "./components/previews/layout-preview";
import { DataTablePreview } from "./components/previews/data-table-preview";

export default function UIPreviewPage() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <Title level={2}>UI Component Preview</Title>
        <Text type="secondary" className="mt-2">
          A comprehensive preview of all UI components following Apple Human Interface
          guidelines.
        </Text>
      </div>

      <SectionWrapper id="buttons" title="Buttons" description="Button components and variations">
        <ButtonPreview />
      </SectionWrapper>

      <SectionWrapper id="inputs" title="Inputs" description="Form input components">
        <InputPreview />
      </SectionWrapper>

      <SectionWrapper id="display" title="Display" description="Data display components">
        <DisplayPreview />
      </SectionWrapper>

      <SectionWrapper id="dialogs" title="Dialogs" description="Modal and overlay components">
        <DialogPreview />
      </SectionWrapper>

      <SectionWrapper id="typography" title="Typography" description="Text and heading components">
        <TypographyPreview />
      </SectionWrapper>

      <SectionWrapper id="form" title="Form" description="Form components with validation">
        <FormPreview />
      </SectionWrapper>

      <SectionWrapper
        id="layout"
        title="Layout & Utilities"
        description="Layout and utility components"
      >
        <LayoutPreview />
      </SectionWrapper>

      <SectionWrapper
        id="data-table"
        title="Data Table"
        description="Advanced data table with sorting, filtering, and pagination"
      >
        <DataTablePreview />
      </SectionWrapper>
    </div>
  );
}
