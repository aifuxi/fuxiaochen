"use client";

import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { closeHistory } from "@tiptap/pm/history";
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  useEditorState,
  type ReactNodeViewProps,
} from "@tiptap/react";

import { CopyCodeButton } from "@/components/ui/copy-code-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { editorLowlight } from "@/lib/posts/code-highlight";
import { codeLanguage, codeLanguageLabel, codeLanguages } from "@/lib/posts/code-languages";

function CodeBlockView({ editor, node, getPos }: ReactNodeViewProps) {
  const editable = useEditorState({
    editor,
    selector: ({ editor: instance }) => instance.isEditable,
  });
  const language = typeof node.attrs.language === "string" ? node.attrs.language : null;
  const knownLanguage = codeLanguage(language);
  const selected = knownLanguage?.value ?? language ?? "plaintext";
  return (
    <NodeViewWrapper className="code-block editor-code-block">
      <div className="code-block-toolbar" contentEditable={false}>
        <Select
          value={selected}
          disabled={!editable}
          onValueChange={(value) => {
            if (!value || !editor.isEditable) return;
            editor.commands.command(({ tr }) => {
              const position = getPos();
              if (typeof position !== "number") return false;
              closeHistory(tr);
              tr.setNodeMarkup(position, undefined, { ...node.attrs, language: value });
              return true;
            });
          }}
        >
          <SelectTrigger className="code-block-language-select" aria-label="代码块语言">
            <SelectValue>{codeLanguageLabel(language)}</SelectValue>
          </SelectTrigger>
          <SelectContent data-cursor="native">
            {!knownLanguage && (
              <SelectItem value={selected}>{codeLanguageLabel(language)}</SelectItem>
            )}
            {codeLanguages.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <CopyCodeButton code={node.textContent} disabled={!editable} />
      </div>
      <pre spellCheck={false}>
        <NodeViewContent<"code"> as="code" style={{ whiteSpace: "pre" }} />
      </pre>
    </NodeViewWrapper>
  );
}

export const EditorCodeBlock = CodeBlockLowlight.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView, { contentDOMElementTag: "span" });
  },
}).configure({ lowlight: editorLowlight, defaultLanguage: "plaintext" });
