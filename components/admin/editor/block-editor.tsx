"use client";

import type { EditorView } from "@tiptap/pm/view";

import { type Editor } from "@tiptap/core";
import DragHandle from "@tiptap/extension-drag-handle-react";
import Placeholder from "@tiptap/extension-placeholder";
import { Selection } from "@tiptap/pm/state";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  Bold,
  Italic,
  Strikethrough,
  Underline,
  Code,
  Link2,
  Undo2,
  Redo2,
  Plus,
  GripVertical,
  Ellipsis,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger, PopoverTitle } from "@/components/ui/popover";
import { contentExtensions } from "@/lib/posts/content-extensions";
import { safeContentUrl } from "@/lib/posts/content-url";
import {
  CONTENT_TEXT_LIMIT,
  documentText,
  readDocument,
  serializeDocument,
  validateDocument,
} from "@/lib/posts/document";
import { markdownDocument } from "@/lib/posts/markdown-document";

import { EditorCodeBlock } from "./code-block";
import { EditorMediaPicker } from "./media-picker";
import { createSlashExtension, insertActions, slashKey } from "./slash-menu";
import "./editor.css";

type Props = {
  initialContent: string;
  onChange: (content: string) => void;
  onReady?: (content: string) => void;
  disabled: boolean;
  invalid: boolean;
  describedBy?: string;
};

// 拖拽配置须保持引用稳定，重新注册插件会销毁正在显示的建议菜单。
const dragPosition = { placement: "left-start", strategy: "absolute" } as const;
const bubblePosition = { placement: "top", offset: 8 } as const;

const articleEditorProps = {
  attributes: {
    id: "admin-post-body",
    role: "textbox",
    "aria-multiline": "true",
    "aria-labelledby": "admin-post-body-label",
    "aria-describedby": "post-editor-help",
    spellcheck: "true",
  },
  handleDOMEvents: {
    keydown: (view: EditorView, event: KeyboardEvent) => {
      if (event.key === "Escape" && slashKey.getState(view.state)?.active) event.stopPropagation();
      return false;
    },
  },
};

function selectedBlock(editor: Editor) {
  const { $from } = editor.state.selection;
  return $from.depth ? $from.before(1) : $from.pos;
}

function BlockMenu({
  editor,
  position,
  disabled,
  children,
}: {
  editor: Editor;
  position: () => number;
  disabled: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState(0);
  const nodes: { pos: number; size: number }[] = [];
  editor.state.doc.forEach((node, pos) => nodes.push({ pos, size: node.nodeSize }));
  const index = nodes.findIndex((node) => node.pos === target);
  const act = (action: "copy" | "delete" | "up" | "down") => {
    const node = editor.state.doc.nodeAt(target);
    if (!node || !editor.isEditable) return;
    setOpen(false);
    editor
      .chain()
      .focus()
      .command(({ tr }) => {
        let next = target;
        if (action === "copy") {
          next = target + node.nodeSize;
          tr.insert(next, node);
        } else if (action === "delete") {
          tr.delete(target, target + node.nodeSize);
          next = Math.min(target, tr.doc.content.size);
        } else {
          const adjacent = nodes[index + (action === "up" ? -1 : 1)];
          if (!adjacent) return false;
          next = action === "up" ? adjacent.pos : target + adjacent.size;
          tr.delete(target, target + node.nodeSize).insert(next, node);
        }
        tr.setSelection(Selection.near(tr.doc.resolve(Math.min(next + 1, tr.doc.content.size))));
        return true;
      })
      .run();
  };
  return (
    <Popover
      open={open}
      onOpenChange={(value) => {
        if (value) setTarget(position());
        setOpen(value);
      }}
    >
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            className="post-editor-icon"
            disabled={disabled}
            aria-label="内容块操作"
            title="内容块操作"
          />
        }
      >
        {children}
      </PopoverTrigger>
      <PopoverContent className="post-editor-popover" data-cursor="native" finalFocus={false}>
        <PopoverTitle>内容块操作</PopoverTitle>
        <Button
          type="button"
          variant="ghost"
          className="post-editor-menu-item"
          disabled={disabled}
          onClick={() => act("copy")}
        >
          <Copy size={16} />
          复制内容块
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="post-editor-menu-item"
          disabled={disabled || index <= 0}
          onClick={() => act("up")}
        >
          <ArrowUp size={16} />
          上移
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="post-editor-menu-item"
          disabled={disabled || index < 0 || index >= nodes.length - 1}
          onClick={() => act("down")}
        >
          <ArrowDown size={16} />
          下移
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="post-editor-menu-item"
          disabled={disabled}
          onClick={() => act("delete")}
        >
          <Trash2 size={16} />
          删除内容块
        </Button>
      </PopoverContent>
    </Popover>
  );
}

export function BlockEditor({
  initialContent,
  onChange,
  onReady,
  disabled,
  invalid,
  describedBy,
}: Props) {
  const host = useRef<HTMLDivElement>(null);
  const hovered = useRef<number | null>(null);
  const [imageSelection, setImageSelection] = useState({ from: 1, to: 1 });
  const [imageOpen, setImageOpen] = useState(false);
  const [insertOpen, setInsertOpen] = useState(false);
  const [link, setLink] = useState<{ from: number; to: number; url: string } | null>(null);
  const [linkError, setLinkError] = useState("");
  const initial = useMemo(() => {
    try {
      return {
        document: validateDocument(
          readDocument(initialContent) ?? markdownDocument(initialContent),
        ),
        error: "",
      };
    } catch {
      return {
        document: { type: "doc", content: [{ type: "paragraph" }] },
        error: "正文无法载入，请保留原始内容并重新载入文章。",
      };
    }
  }, [initialContent]);
  const openImage = useCallback((instance: Editor) => {
    if (!instance.isEditable) return;
    setImageSelection({
      from: instance.state.selection.from,
      to: instance.state.selection.to,
    });
    setImageOpen(true);
  }, []);
  const extensions = useMemo(
    () => [
      ...contentExtensions({ codeBlock: EditorCodeBlock }),
      Placeholder.configure({
        placeholder: ({ node }) =>
          node.type.name === "codeBlock" ? "" : "开始写作，输入 / 插入内容…",
      }),
      createSlashExtension(openImage),
    ],
    [openImage],
  );
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    extensions,
    content: initial.document,
    editable: !disabled && !initial.error,
    editorProps: articleEditorProps,
    onUpdate: ({ editor: instance }) => onChange(serializeDocument(instance.getJSON())),
  });
  const state = useEditorState({
    editor,
    selector: ({ editor: instance }) =>
      instance
        ? {
            bold: instance.isActive("bold"),
            italic: instance.isActive("italic"),
            strike: instance.isActive("strike"),
            underline: instance.isActive("underline"),
            code: instance.isActive("code"),
            link: instance.isActive("link"),
            table: instance.isActive("table"),
            canUndo: instance.can().undo(),
            canRedo: instance.can().redo(),
            count: documentText(instance.getJSON()).length,
            block: selectedBlock(instance),
          }
        : null,
  });
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled && !initial.error);
    const dom = editor.view.dom;
    dom.setAttribute("aria-invalid", String(invalid));
    dom.setAttribute("aria-disabled", String(disabled || Boolean(initial.error)));
    dom.setAttribute(
      "aria-describedby",
      ["post-editor-help", describedBy].filter(Boolean).join(" "),
    );
  }, [editor, disabled, initial.error, invalid, describedBy]);
  // 旧文章只在用户主动保存时转成 JSON，不在初始化时发送写请求。
  useEffect(() => {
    if (editor && !initial.error) {
      const content = serializeDocument(editor.getJSON());
      if (onReady) onReady(content);
      else onChange(content);
    }
  }, [editor, initial.error, onChange, onReady]);
  if (initial.error)
    return (
      <p className="admin-post-error" role="alert">
        {initial.error}
      </p>
    );
  if (!editor || !state) return <output>正在载入编辑器…</output>;
  const editLink = () => {
    setLink({
      from: editor.state.selection.from,
      to: editor.state.selection.to,
      url: String(editor.getAttributes("link").href ?? ""),
    });
    setLinkError("");
  };
  const applyLink = () => {
    if (!link || disabled) return;
    const url = link.url.trim();
    if (url && !safeContentUrl(url)) {
      setLinkError("请输入 http、https、mailto、tel 地址、站内路径或锚点。");
      return;
    }
    const chain = editor
      .chain()
      .focus()
      .setTextSelection({ from: link.from, to: link.to })
      .extendMarkRange("link");
    if (url) chain.setLink({ href: url }).run();
    else chain.unsetLink().run();
    setLink(null);
  };
  const formats = [
    {
      name: "加粗",
      active: state.bold,
      icon: Bold,
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      name: "斜体",
      active: state.italic,
      icon: Italic,
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      name: "删除线",
      active: state.strike,
      icon: Strikethrough,
      run: () => editor.chain().focus().toggleStrike().run(),
    },
    {
      name: "下划线",
      active: state.underline,
      icon: Underline,
      run: () => editor.chain().focus().toggleUnderline().run(),
    },
    {
      name: "行内代码",
      active: state.code,
      icon: Code,
      run: () => editor.chain().focus().toggleCode().run(),
    },
    { name: "链接", active: state.link, icon: Link2, run: editLink },
  ];
  const formatButtons = formats.map((item) => (
    <Button
      key={item.name}
      type="button"
      variant="ghost"
      className="post-editor-icon"
      title={item.name}
      aria-label={item.name}
      aria-pressed={item.active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={item.run}
    >
      <item.icon size={17} aria-hidden="true" />
    </Button>
  ));
  const closeImage = () => {
    setImageOpen(false);
    editor.commands.focus();
  };
  return (
    <div className="post-block-editor" ref={host} data-disabled={disabled} data-invalid={invalid}>
      <fieldset className="post-editor-toolbar" aria-label="正文编辑工具">
        <Popover open={insertOpen} onOpenChange={setInsertOpen}>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                className="post-editor-insert"
                disabled={disabled}
              />
            }
          >
            <Plus size={17} aria-hidden="true" />
            插入
          </PopoverTrigger>
          <PopoverContent className="post-editor-popover" data-cursor="native" finalFocus={false}>
            <PopoverTitle>插入内容</PopoverTitle>
            {insertActions(openImage).map((item) => (
              <Button
                key={item.title}
                type="button"
                variant="ghost"
                className="post-editor-menu-item"
                disabled={disabled}
                onClick={() => {
                  setInsertOpen(false);
                  item.run(editor);
                }}
              >
                <item.icon size={17} aria-hidden="true" />
                {item.title}
              </Button>
            ))}
          </PopoverContent>
        </Popover>
        <span className="post-editor-toolbar-divider" aria-hidden="true" />
        {formatButtons}
        <span className="post-editor-toolbar-divider" aria-hidden="true" />
        <Button
          type="button"
          variant="ghost"
          className="post-editor-icon"
          disabled={disabled || !state.canUndo}
          aria-label="撤销"
          title="撤销"
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 size={17} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="post-editor-icon"
          disabled={disabled || !state.canRedo}
          aria-label="重做"
          title="重做"
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 size={17} />
        </Button>
        <BlockMenu editor={editor} disabled={disabled} position={() => state.block}>
          <Ellipsis size={17} />
        </BlockMenu>
      </fieldset>
      {state.table && (
        <fieldset className="post-editor-table-tools" aria-label="表格操作">
          {[
            { title: "增加行", run: () => editor.chain().focus().addRowAfter().run() },
            { title: "增加列", run: () => editor.chain().focus().addColumnAfter().run() },
            { title: "删除行", run: () => editor.chain().focus().deleteRow().run() },
            { title: "删除列", run: () => editor.chain().focus().deleteColumn().run() },
            { title: "删除表格", run: () => editor.chain().focus().deleteTable().run() },
          ].map((item) => (
            <Button
              key={item.title}
              type="button"
              size="compact"
              variant="ghost"
              disabled={disabled}
              onClick={item.run}
            >
              {item.title}
            </Button>
          ))}
        </fieldset>
      )}
      <EditorContent editor={editor} className="post-editor-canvas" />
      {!disabled && (
        <DragHandle
          editor={editor}
          className="post-editor-drag-handle"
          computePositionConfig={dragPosition}
          onNodeChange={({ node, pos }) => {
            hovered.current = node ? pos : null;
          }}
        >
          <span className="post-editor-grip" aria-hidden="true" title="拖动调整内容块顺序">
            <GripVertical size={18} />
          </span>
          <BlockMenu
            editor={editor}
            disabled={disabled}
            position={() => hovered.current ?? selectedBlock(editor)}
          >
            <Ellipsis size={16} />
          </BlockMenu>
        </DragHandle>
      )}
      <BubbleMenu
        editor={editor}
        appendTo={() => host.current!}
        className="post-editor-bubble"
        options={bubblePosition}
        shouldShow={({ editor: instance, from, to }) =>
          instance.isEditable &&
          from !== to &&
          !instance.isActive("codeBlock") &&
          instance.state.doc.textBetween(from, to).trim().length > 0
        }
      >
        <fieldset aria-label="选中文字格式">{formatButtons}</fieldset>
      </BubbleMenu>
      <div className="post-editor-footer">
        <p id="post-editor-help">输入 / 插入内容 · 选中文字设置格式 · 拖动左侧手柄排序</p>
        <output
          className={state.count > CONTENT_TEXT_LIMIT ? "admin-post-error" : ""}
          aria-label="正文字符数"
        >
          {state.count.toLocaleString()} / {CONTENT_TEXT_LIMIT.toLocaleString()}
        </output>
      </div>
      {imageOpen && (
        <EditorMediaPicker
          onClose={closeImage}
          onInsert={(image, alt) => {
            if (!image.url || disabled) return;
            editor
              .chain()
              .focus()
              .setTextSelection(imageSelection)
              .setImage({ src: image.url, alt })
              .run();
            setImageOpen(false);
          }}
        />
      )}
      <Dialog
        open={link !== null}
        onOpenChange={(open) => {
          if (!open) {
            setLink(null);
            editor.commands.focus();
          }
        }}
      >
        <DialogContent className="post-editor-link-dialog" data-cursor="native" finalFocus={false}>
          <DialogTitle>编辑链接</DialogTitle>
          <DialogDescription>填写链接地址；清空地址可移除链接。</DialogDescription>
          <label className="post-editor-field" htmlFor="post-link-url">
            链接地址
            <Input
              id="post-link-url"
              value={link?.url ?? ""}
              maxLength={2000}
              aria-invalid={Boolean(linkError)}
              aria-describedby={linkError ? "post-link-error" : undefined}
              onChange={(event) =>
                setLink((current) => (current ? { ...current, url: event.target.value } : null))
              }
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  applyLink();
                }
              }}
            />
          </label>
          {linkError && (
            <p id="post-link-error" className="admin-post-error" role="alert">
              {linkError}
            </p>
          )}
          <div className="admin-form-actions">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setLink(null);
                editor.commands.focus();
              }}
            >
              取消
            </Button>
            <Button type="button" variant="primary" disabled={disabled} onClick={applyLink}>
              应用
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
