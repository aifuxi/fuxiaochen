import { Text } from "@/components/ui/typography/text";
import { Title } from "@/components/ui/typography/title";
import { ButtonPreview } from "./components/previews/button-preview";
import { DataTablePreview } from "./components/previews/data-table-preview";
import { DialogPreview } from "./components/previews/dialog-preview";
import { DisplayPreview } from "./components/previews/display-preview";
import { FormPreview } from "./components/previews/form-preview";
import { InputPreview } from "./components/previews/input-preview";
import { LayoutPreview } from "./components/previews/layout-preview";
import { TypographyPreview } from "./components/previews/typography-preview";
import { SectionWrapper } from "./components/section-wrapper";

export default function UIPreviewPage() {
  return (
    <div className="container-shell space-y-8 py-12">
      <div className="rounded-[var(--radius-xl)] border border-white/10 bg-white/4 px-6 py-10 backdrop-blur-xl">
        <div className={`
          text-label mb-4 inline-flex rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-primary
        `}>
          Chen Serif v1.0
        </div>
        <Title level={2} className={`
          text-5xl
          md:text-6xl
        `}>
          Design System Playground
        </Title>
        <Text type="secondary" className="mt-4 max-w-3xl text-base leading-7">
          浏览
          token、字体、按钮、表单、表格、弹层和布局模式，确认当前项目已经切换到
          Chen Serif 语义化组件系统。
        </Text>
      </div>

      <SectionWrapper
        id="buttons"
        title="Buttons"
        description="Button components and variations"
      >
        <ButtonPreview />
      </SectionWrapper>

      <SectionWrapper
        id="inputs"
        title="Inputs"
        description="Form input components"
      >
        <InputPreview />
      </SectionWrapper>

      <SectionWrapper
        id="display"
        title="Display"
        description="Data display components"
      >
        <DisplayPreview />
      </SectionWrapper>

      <SectionWrapper
        id="dialogs"
        title="Dialogs"
        description="Modal and overlay components"
      >
        <DialogPreview />
      </SectionWrapper>

      <SectionWrapper
        id="typography"
        title="Typography"
        description="Text and heading components"
      >
        <TypographyPreview />
      </SectionWrapper>

      <SectionWrapper
        id="form"
        title="Form"
        description="Form components with validation"
      >
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
