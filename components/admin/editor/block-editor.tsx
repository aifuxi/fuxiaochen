"use client";

import type { Editor } from "@tiptap/core";
import type { EditorState } from "@tiptap/pm/state";

import { posToDOMRect } from "@tiptap/core";
import DragHandle from "@tiptap/extension-drag-handle-react";
import { closeHistory } from "@tiptap/pm/history";
import { NodeSelection } from "@tiptap/pm/state";
import { CellSelection } from "@tiptap/pm/tables";
import { Decoration, DecorationSet, type EditorView } from "@tiptap/pm/view";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus";
import {
  Bold,
  Italic,
  Strikethrough,
  Underline,
  Code,
  Link2,
  Plus,
  Ellipsis,
  Eraser,
  Type,
  ImagePlus,
  Trash2,
  Scan,
  Undo2,
  Redo2,
  FileInput,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Crop,
  MessageSquareText,
  RotateCcw,
  Grid2X2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/menu";
import { Popover, PopoverContent, PopoverTitle } from "@/components/ui/popover";
import { contentExtensions } from "@/lib/posts/content-extensions";
import { safeContentUrl } from "@/lib/posts/content-url";
import {
  CONTENT_TEXT_LIMIT,
  documentText,
  readDocument,
  serializeDocument,
  draftContentSchema,
  postContentSchema,
} from "@/lib/posts/document";
import { IMAGE_ACTION_META, IMAGE_UI_META, boundedImageSize } from "@/lib/posts/image-layout";
import { markdownDocument } from "@/lib/posts/markdown-document";
import { isImageParagraph } from "@/lib/posts/prose";

import { EditorCodeBlock } from "./code-block";
import { blockTypeName, insertActions, selectedBlock } from "./editor-commands";
import { AlignmentMenu, BlockMenu, ColorMenu, CommandMenu, TablePicker } from "./editor-menus";
import { EditorImageUpload, IMAGE_UPLOAD_REQUEST, IMAGE_URL_REQUEST } from "./image-upload";
import { ImageUploadAnchors } from "./image-upload-state";
import { EditorImage } from "./image-view";
import { MarkdownImportDialog } from "./markdown-import-dialog";
import { OutlineAnchors } from "./outline";
import { createSlashExtension, slashKey } from "./slash-menu";
import { TableControls, TableTools } from "./table-controls";
import "./editor.css";

export type EditorTools = {
  editor: Editor | null;
  error: string;
  busy: boolean;
  uploading: boolean;
  openImageUrl: () => void;
  openImport: () => void;
};
type Props = {
  initialContent: string;
  onChange: (content: string) => void;
  onReady?: (content: string) => void;
  onToolsReady: (tools: EditorTools | null) => void;
  disabled: boolean;
  invalid: boolean;
  describedBy?: string;
};

// 插件配置保持引用稳定，保存与主题切换不能重新注册插件或关闭建议菜单。
const dragPosition = { placement: "left-start", strategy: "absolute" } as const;
const bubblePosition = {
  placement: "top",
  offset: 8,
  flip: { padding: { top: 80, bottom: 12, left: 12, right: 12 } },
  shift: { padding: { top: 80, bottom: 12, left: 12, right: 12 } },
} as const;
const emptyPosition = {
  placement: "left",
  offset: 8,
  // 整行选中后锚点落在段落边界，窄屏仍需把插入按钮留在视口内。
  shift: { crossAxis: true, padding: 12 },
} as const;
const articleEditorProps = {
  attributes: {
    class: "article-prose article-editor-prose",
    id: "admin-post-body",
    role: "textbox",
    "aria-multiline": "true",
    "aria-labelledby": "admin-post-body-label",
    "aria-describedby": "post-editor-help",
    spellcheck: "true",
  },
  decorations: (state: EditorState) => {
    const decorations: Decoration[] = [];
    state.doc.descendants((node, position) => {
      if (isImageParagraph(node))
        decorations.push(
          Decoration.node(position, position + node.nodeSize, { class: "article-image-block" }),
        );
      return !node.isTextblock;
    });
    return DecorationSet.create(state.doc, decorations);
  },
  handleDOMEvents: {
    keydown: (view: EditorView, event: KeyboardEvent) => {
      if (event.key === "Escape" && slashKey.getState(view.state)?.active) event.stopPropagation();
      return false;
    },
  },
};

export function EditorDocumentMenu({
  tools,
  disabled,
}: {
  tools: EditorTools | null;
  disabled: boolean;
}) {
  const editor = tools?.editor ?? null;
  const history = useEditorState({
    editor,
    selector: ({ editor: instance }) =>
      instance ? { undo: instance.can().undo(), redo: instance.can().redo() } : null,
  });
  return (
    <Menu>
      <MenuTrigger
        render={<Button type="button" variant="ghost" size="compact" />}
        disabled={disabled || !editor}
        aria-label="更多文档操作"
      >
        <Ellipsis size={19} />
      </MenuTrigger>
      <MenuContent className="post-editor-command-menu" finalFocus={false}>
        <MenuItem
          disabled={disabled || !history?.undo}
          onClick={() => editor?.chain().focus().undo().run()}
        >
          <Undo2 size={16} />
          撤销
        </MenuItem>
        <MenuItem
          disabled={disabled || !history?.redo}
          onClick={() => editor?.chain().focus().redo().run()}
        >
          <Redo2 size={16} />
          重做
        </MenuItem>
        <MenuItem disabled={disabled} onClick={() => tools?.openImageUrl()}>
          <ImagePlus size={16} />
          插入网络图片
        </MenuItem>
        <MenuItem disabled={disabled} onClick={() => tools?.openImport()}>
          <FileInput size={16} />
          导入 Markdown
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}

export function BlockEditor({
  initialContent,
  onChange,
  onReady,
  onToolsReady,
  disabled,
  invalid,
  describedBy,
}: Props) {
  const host = useRef<HTMLDivElement>(null);
  const hovered = useRef<number | null>(null);
  const emptyMenuOpen = useRef(false);
  const blockMenuOpen = useRef(false);
  const [imageEditing, setImageEditing] = useState(false);
  const [writingBarHeight, setWritingBarHeight] = useState(64);
  const floatingPosition = useMemo(
    () => ({
      ...bubblePosition,
      flip: { padding: { top: writingBarHeight + 12, bottom: 12, left: 12, right: 12 } },
      shift: { padding: { top: writingBarHeight + 12, bottom: 12, left: 12, right: 12 } },
    }),
    [writingBarHeight],
  );
  useEffect(() => {
    const bar = document.querySelector(".post-writing-bar");
    if (!bar) return undefined;
    const observer = new ResizeObserver(([entry]) =>
      setWritingBarHeight(entry.target.getBoundingClientRect().height),
    );
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);
  const [hoveredBlock, setHoveredBlock] = useState<{
    pos: number;
    node: Editor["state"]["doc"];
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [table, setTable] = useState<{ position: number } | null>(null);
  const [importPosition, setImportPosition] = useState<number | null>(null);
  const [link, setLink] = useState<{ from: number; to: number; url: string } | null>(null);
  const [linkError, setLinkError] = useState("");
  const [alt, setAlt] = useState<{ position: number; value: string } | null>(null);
  const [size, setSize] = useState<{ position: number; width: string; ratio: number } | null>(null);
  const [sizeError, setSizeError] = useState("");
  const [status, setStatus] = useState("");
  const initial = useMemo(() => {
    try {
      return { document: readDocument(initialContent), error: "" };
    } catch {
      return {
        document: { type: "doc", content: [{ type: "paragraph" }] },
        error: "正文无法载入，请保留原始内容并重新载入文章。",
      };
    }
  }, [initialContent]);
  const openImage = useCallback((instance: Editor, position: number | null = null) => {
    if (!instance.isEditable) return;
    instance.view.dispatch(
      instance.state.tr.setMeta(IMAGE_UPLOAD_REQUEST, { position }).setMeta("addToHistory", false),
    );
  }, []);
  const openTable = useCallback((instance: Editor, position: number | null = null) => {
    if (!instance.isEditable) return;
    setTable({ position: position ?? instance.state.selection.from });
  }, []);
  const handlers = useMemo(() => ({ image: openImage, table: openTable }), [openImage, openTable]);
  const extensions = useMemo(
    () => [
      ...contentExtensions({ codeBlock: EditorCodeBlock, image: EditorImage, editable: true }),
      OutlineAnchors,
      ImageUploadAnchors,
      createSlashExtension(handlers),
    ],
    [handlers],
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
            imageAlignment: instance.getAttributes("paragraph").textAlign ?? "left",
            imageCropped: Boolean(instance.getAttributes("image").crop),
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
  useEffect(() => {
    if (editor && !initial.error) {
      const content = serializeDocument(editor.getJSON());
      if (onReady) onReady(content);
      else onChange(content);
    }
  }, [editor, initial.error, onChange, onReady]);
  useEffect(() => {
    if (!editor) return undefined;
    const sync = ({ transaction }: { transaction: EditorState["tr"] }) => {
      const active = transaction.getMeta(IMAGE_UI_META);
      if (active !== undefined) setImageEditing(Boolean(active));
    };
    editor.on("transaction", sync);
    return () => {
      editor.off("transaction", sync);
    };
  }, [editor]);
  const busy = Boolean(table || link || alt || size || importPosition !== null || imageEditing);
  useEffect(() => {
    if (!editor) return undefined;
    // 非模态图片编辑结束时选区可以完全不变；显式刷新可见性，不伪造正文事务。
    const frame = requestAnimationFrame(() => {
      if (editor.isDestroyed) return;
      const selection = editor.state.selection;
      const active =
        busy || blockMenuOpen.current
          ? null
          : editor.isActive("image")
            ? "image-context-bubble"
            : selection instanceof CellSelection
              ? "table-context-bubble"
              : !selection.empty &&
                  !(selection instanceof NodeSelection) &&
                  !editor.isActive("codeBlock")
                ? "text-format-bubble"
                : null;
      let tr = editor.state.tr;
      for (const key of ["image-context-bubble", "table-context-bubble", "text-format-bubble"])
        tr = tr.setMeta(key, key === active ? "show" : "hide");
      editor.view.dispatch(tr);
      if (active) editor.view.dispatch(editor.state.tr.setMeta(active, "updatePosition"));
    });
    return () => cancelAnimationFrame(frame);
  }, [editor, busy]);
  useEffect(() => {
    onToolsReady({
      editor,
      error: initial.error,
      busy: busy || uploading,
      uploading,
      openImageUrl: () => {
        if (editor)
          editor.view.dispatch(
            editor.state.tr.setMeta(IMAGE_URL_REQUEST, true).setMeta("addToHistory", false),
          );
      },
      openImport: () => {
        if (editor?.isEditable) setImportPosition(editor.state.selection.from);
      },
    });
  }, [editor, initial.error, busy, uploading, onToolsReady]);
  useEffect(() => () => onToolsReady(null), [onToolsReady]);
  if (initial.error)
    return (
      <p className="admin-post-error" role="alert">
        {initial.error}
      </p>
    );
  if (!editor || !state) return <output>正在载入编辑器…</output>;
  const closeTable = () => {
    setTable(null);
    editor.commands.focus();
  };
  const applyLink = () => {
    if (!link || !editor.isEditable) return;
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
      name: "下划线",
      active: state.underline,
      icon: Underline,
      run: () => editor.chain().focus().toggleUnderline().run(),
    },
    {
      name: "删除线",
      active: state.strike,
      icon: Strikethrough,
      run: () => editor.chain().focus().toggleStrike().run(),
    },
    {
      name: "行内代码",
      active: state.code,
      icon: Code,
      run: () => editor.chain().focus().toggleCode().run(),
    },
    {
      name: "链接",
      active: state.link,
      icon: Link2,
      run: () => {
        setLink({
          from: editor.state.selection.from,
          to: editor.state.selection.to,
          url: String(editor.getAttributes("link").href ?? ""),
        });
        setLinkError("");
      },
    },
  ];
  const formatOrder = ["加粗", "删除线", "斜体", "下划线", "链接", "行内代码"];
  const formatButtons = formats
    .toSorted((a, b) => formatOrder.indexOf(a.name) - formatOrder.indexOf(b.name))
    .map((item) => (
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
  const hoveredNode =
    hoveredBlock && hoveredBlock.pos >= 0 && hoveredBlock.pos < editor.state.doc.content.size
      ? editor.state.doc.nodeAt(hoveredBlock.pos)
      : null;
  const hideBlockHandle =
    !hoveredNode || (hoveredNode.type.name === "paragraph" && hoveredNode.content.size === 0);
  const typeName = isImageParagraph(hoveredNode ?? editor.state.doc)
    ? "图片"
    : blockTypeName(hoveredNode);
  const TypeIcon = insertActions(handlers).find((item) => item.title === typeName)?.icon ?? Type;
  return (
    <div
      className="post-block-editor"
      ref={host}
      data-disabled={disabled}
      data-invalid={invalid}
      data-uploading={uploading}
    >
      <BlockMenu
        editor={editor}
        disabled={disabled}
        handlers={handlers}
        onStatus={setStatus}
        onOpenChange={(open) => {
          blockMenuOpen.current = open;
        }}
        context
      >
        <EditorContent editor={editor} className="post-editor-canvas" />
      </BlockMenu>
      {!disabled && (
        <DragHandle
          editor={editor}
          className={`post-editor-drag-handle${hideBlockHandle ? " is-empty" : ""}`}
          computePositionConfig={dragPosition}
          onNodeChange={({ node, pos }) => {
            hovered.current = node ? pos : null;
            setHoveredBlock((current) =>
              current?.pos === pos && current?.node === node
                ? current
                : node
                  ? { pos, node }
                  : null,
            );
          }}
        >
          <div className="post-editor-block-handle">
            <BlockMenu
              editor={editor}
              disabled={disabled}
              handlers={handlers}
              position={() => hovered.current ?? selectedBlock(editor)}
              onStatus={setStatus}
              onOpenChange={(open) => {
                blockMenuOpen.current = open;
              }}
            >
              <TypeIcon size={15} />
            </BlockMenu>
          </div>
        </DragHandle>
      )}
      <FloatingMenu
        editor={editor}
        pluginKey="empty-paragraph-insert"
        className="post-empty-insert"
        options={emptyPosition}
        shouldShow={({ editor: instance, state: current }) =>
          instance.isEditable &&
          !busy &&
          !uploading &&
          !blockMenuOpen.current &&
          !instance.isActive("table") &&
          (emptyMenuOpen.current ||
            (instance.isFocused &&
              current.selection.empty &&
              current.selection.$from.parent.type.name === "paragraph" &&
              current.selection.$from.parent.content.size === 0))
        }
      >
        <CommandMenu
          editor={editor}
          disabled={disabled}
          handlers={handlers}
          onOpenChange={(open) => {
            emptyMenuOpen.current = open;
          }}
        >
          <Plus size={17} />
        </CommandMenu>
      </FloatingMenu>
      <BubbleMenu
        editor={editor}
        updateDelay={0}
        pluginKey="text-format-bubble"
        appendTo={() => host.current!}
        className="post-editor-bubble"
        options={floatingPosition}
        shouldShow={({ editor: instance, from, to }) =>
          instance.isEditable &&
          !busy &&
          !blockMenuOpen.current &&
          from !== to &&
          !(instance.state.selection instanceof NodeSelection) &&
          !(instance.state.selection instanceof CellSelection) &&
          !instance.isActive("codeBlock") &&
          instance.state.doc.textBetween(from, to).trim().length > 0
        }
      >
        <div role="toolbar" aria-label="选中文字格式">
          <CommandMenu editor={editor} disabled={disabled} handlers={handlers} convert>
            <Type size={17} />
          </CommandMenu>
          <span className="post-editor-toolbar-divider" aria-hidden="true" />
          <AlignmentMenu editor={editor} disabled={disabled} />
          <span className="post-editor-toolbar-divider" aria-hidden="true" />
          {formatButtons}
          <ColorMenu editor={editor} disabled={disabled} />
          <span className="post-editor-toolbar-divider" aria-hidden="true" />
          <Menu>
            <MenuTrigger
              disabled={disabled}
              aria-label="更多文字操作"
              title="更多文字操作"
              render={<Button type="button" variant="ghost" className="post-editor-icon" />}
            >
              <Grid2X2 size={18} />
            </MenuTrigger>
            <MenuContent
              className="post-editor-command-menu"
              finalFocus={(method) => (method === "keyboard" ? editor.view.dom : false)}
            >
              <MenuItem
                disabled={disabled}
                onClick={() => editor.chain().focus().unsetAllMarks().run()}
              >
                <Eraser size={16} />
                清除文字格式
              </MenuItem>
            </MenuContent>
          </Menu>
        </div>
      </BubbleMenu>
      <BubbleMenu
        editor={editor}
        updateDelay={0}
        pluginKey="table-context-bubble"
        appendTo={() => host.current!}
        className="post-editor-bubble"
        options={floatingPosition}
        shouldShow={({ editor: instance }) =>
          instance.isEditable &&
          !busy &&
          !blockMenuOpen.current &&
          instance.isActive("table") &&
          instance.state.selection instanceof CellSelection
        }
      >
        <TableTools editor={editor} disabled={disabled}>
          <CommandMenu editor={editor} disabled={disabled} handlers={handlers} convert>
            <Type size={17} />
          </CommandMenu>
          <span className="post-editor-toolbar-divider" aria-hidden="true" />
          <AlignmentMenu editor={editor} disabled={disabled} />
          <span className="post-editor-toolbar-divider" aria-hidden="true" />
          {formatButtons.filter((button) => button.key !== "链接")}
          <ColorMenu editor={editor} disabled={disabled} />
        </TableTools>
      </BubbleMenu>
      <TableControls editor={editor} host={host} disabled={disabled || busy} />
      <BubbleMenu
        editor={editor}
        updateDelay={0}
        pluginKey="image-context-bubble"
        appendTo={() => host.current!}
        className="post-editor-bubble"
        options={floatingPosition}
        shouldShow={({ editor: instance }) =>
          instance.isEditable && !busy && !blockMenuOpen.current && instance.isActive("image")
        }
      >
        <div role="toolbar" aria-label="图片工具">
          <Button
            type="button"
            variant="ghost"
            className="post-editor-icon"
            disabled={disabled}
            aria-label="裁剪图片"
            title="裁剪图片"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() =>
              editor.view.dispatch(
                editor.state.tr.setMeta(IMAGE_ACTION_META, {
                  position: editor.state.selection.from,
                  action: "crop",
                }),
              )
            }
          >
            <Crop size={18} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="post-editor-icon"
            disabled={disabled}
            aria-label="图片描述"
            title="图片描述"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() =>
              editor.view.dispatch(
                editor.state.tr.setMeta(IMAGE_ACTION_META, {
                  position: editor.state.selection.from,
                  action: "caption",
                }),
              )
            }
          >
            <MessageSquareText size={18} />
          </Button>
          <span className="post-editor-toolbar-divider" aria-hidden="true" />
          {[
            { value: "left", label: "图片左对齐", icon: AlignLeft },
            { value: "center", label: "图片居中", icon: AlignCenter },
            { value: "right", label: "图片右对齐", icon: AlignRight },
          ].map((item) => (
            <Button
              key={item.value}
              type="button"
              variant="ghost"
              className="post-editor-icon"
              disabled={disabled}
              aria-label={item.label}
              title={item.label}
              aria-pressed={state.imageAlignment === item.value}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => editor.chain().focus().setTextAlign(item.value).run()}
            >
              <item.icon size={18} />
            </Button>
          ))}
          {state.imageCropped && (
            <Button
              type="button"
              variant="ghost"
              className="post-editor-icon"
              disabled={disabled}
              aria-label="恢复裁剪"
              title="恢复裁剪"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                const attrs = editor.getAttributes("image");
                const crop = attrs.crop;
                editor
                  .chain()
                  .focus()
                  .updateAttributes("image", {
                    crop: null,
                    ...(attrs.width && attrs.height && crop
                      ? boundedImageSize(attrs.width / crop.width, attrs.height / crop.height)
                      : { width: null, height: null }),
                  })
                  .run();
              }}
            >
              <RotateCcw size={18} />
            </Button>
          )}
          <span className="post-editor-toolbar-divider" aria-hidden="true" />
          <Menu>
            <MenuTrigger
              disabled={disabled}
              aria-label="更多图片操作"
              title="更多图片操作"
              render={<Button type="button" variant="ghost" className="post-editor-icon" />}
            >
              <Ellipsis size={18} />
            </MenuTrigger>
            <MenuContent
              className="post-editor-command-menu"
              finalFocus={(method) => (method === "keyboard" ? editor.view.dom : false)}
            >
              <MenuItem disabled={disabled} onClick={() => openImage(editor)}>
                <ImagePlus size={16} />
                替换图片
              </MenuItem>
              <MenuItem
                disabled={disabled}
                onClick={() => {
                  const position = editor.state.selection.from;
                  const element = editor.view.nodeDOM(position);
                  const imageElement =
                    element instanceof HTMLElement ? element.querySelector("img") : null;
                  const attrs = editor.getAttributes("image");
                  const width = imageElement?.offsetWidth || attrs.width || 240;
                  const ratio =
                    attrs.width && attrs.height
                      ? attrs.width / attrs.height
                      : imageElement?.naturalWidth && imageElement.naturalHeight
                        ? imageElement.naturalWidth / imageElement.naturalHeight
                        : 1;
                  setSizeError("");
                  setSize({ position, width: String(width), ratio });
                }}
              >
                <Scan size={16} />
                图片尺寸
              </MenuItem>
              <MenuItem
                disabled={disabled}
                onClick={() =>
                  setAlt({
                    position: editor.state.selection.from,
                    value: editor.getAttributes("image").alt ?? "",
                  })
                }
              >
                <Type size={16} />
                替代文字
              </MenuItem>
              <MenuItem
                disabled={disabled}
                onClick={() => {
                  const attrs = editor.getAttributes("image");
                  const node = editor.view.nodeDOM(editor.state.selection.from);
                  const img =
                    node instanceof HTMLElement
                      ? node.querySelector<HTMLImageElement>("img[src]")
                      : null;
                  const dimensions =
                    attrs.crop && img?.naturalWidth && img.naturalHeight
                      ? boundedImageSize(
                          img.naturalWidth * attrs.crop.width,
                          img.naturalHeight * attrs.crop.height,
                        )
                      : attrs.crop
                        ? { width: attrs.width, height: attrs.height }
                        : { width: null, height: null };
                  editor.chain().focus().updateAttributes("image", dimensions).run();
                }}
              >
                <Scan size={16} />
                恢复图片原始尺寸
              </MenuItem>
              <MenuItem
                disabled={disabled}
                destructive
                onClick={() => editor.chain().focus().deleteSelection().run()}
              >
                <Trash2 size={16} />
                删除图片
              </MenuItem>
            </MenuContent>
          </Menu>
        </div>
      </BubbleMenu>
      <span id="post-editor-help" className="sr-only">
        输入 / 插入内容；选中文字设置格式；右键或 Shift+F10 打开内容块菜单，触屏可长按内容块。
      </span>
      <output
        className={`post-document-count${state.count > CONTENT_TEXT_LIMIT ? " admin-post-error" : ""}`}
        aria-label="正文字符数"
      >
        {state.count.toLocaleString()} / {CONTENT_TEXT_LIMIT.toLocaleString()}
      </output>
      <output className="post-editor-action-status" aria-live="polite">
        {status}
      </output>
      {importPosition !== null && (
        <MarkdownImportDialog
          disabled={disabled}
          finalFocus={() => editor.view.dom}
          onClose={() => {
            setImportPosition(null);
            editor.commands.focus();
          }}
          onImport={(source) => {
            if (!editor.isEditable) throw new Error("当前不能导入正文。");
            const document = readDocument(
              postContentSchema.parse(serializeDocument(markdownDocument(source))),
            );
            const inserted = editor
              .chain()
              .command(({ tr }) => {
                closeHistory(tr);
                return true;
              })
              .insertContentAt(importPosition, document.content ?? [], {
                errorOnInvalidContent: true,
              })
              .command(({ tr }) => {
                draftContentSchema.parse(serializeDocument(tr.doc.toJSON()));
                return true;
              })
              .run();
            if (!inserted) throw new Error("内容无法插入当前位置，请选择正文中的其他位置。");
            editor.view.dispatch(closeHistory(editor.state.tr));
          }}
        />
      )}
      <EditorImageUpload editor={editor} onPendingChange={setUploading} />
      {table && (
        <TablePicker
          anchor={{
            getBoundingClientRect: () => posToDOMRect(editor.view, table.position, table.position),
          }}
          disabled={disabled}
          finalFocus={() => editor.view.dom}
          onClose={closeTable}
          onInsert={(rows, cols) => {
            if (!editor.isEditable) throw new Error("请等待文章保存完成。");
            const content = {
              type: "table",
              content: Array.from({ length: rows }, () => ({
                type: "tableRow",
                content: Array.from({ length: cols }, () => ({
                  type: "tableCell",
                  content: [{ type: "paragraph" }],
                })),
              })),
            };
            const inserted = editor
              .chain()
              .focus()
              .insertContentAt(table.position, content)
              .command(({ tr }) => {
                draftContentSchema.parse(serializeDocument(tr.doc.toJSON()));
                return true;
              })
              .run();
            if (!inserted) throw new Error("表格无法插入当前位置。");
            setTable(null);
          }}
        />
      )}
      <Popover
        open={link !== null}
        onOpenChange={(open) => {
          if (!open) {
            setLink(null);
            editor.commands.focus();
          }
        }}
      >
        <PopoverContent
          className="post-editor-link-popover"
          side="bottom"
          align="start"
          sideOffset={8}
          anchor={{
            getBoundingClientRect: () =>
              posToDOMRect(
                editor.view,
                link?.from ?? editor.state.selection.from,
                link?.to ?? editor.state.selection.to,
              ),
          }}
          finalFocus={() => editor.view.dom}
        >
          <PopoverTitle className="sr-only">编辑链接</PopoverTitle>
          <div className="post-editor-link-row">
            <Input
              aria-label="链接地址"
              placeholder="粘贴或输入链接"
              id="post-link-url"
              value={link?.url ?? ""}
              maxLength={2000}
              disabled={disabled}
              aria-invalid={Boolean(linkError)}
              aria-describedby={linkError ? "post-link-error" : undefined}
              onChange={(event) =>
                setLink((current) => (current ? { ...current, url: event.target.value } : null))
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.nativeEvent.isComposing &&
                  event.nativeEvent.keyCode !== 229
                ) {
                  event.preventDefault();
                  applyLink();
                }
              }}
            />
            <Button type="button" variant="primary" disabled={disabled} onClick={applyLink}>
              确认
            </Button>
          </div>
          {linkError && (
            <p id="post-link-error" className="admin-post-error" role="alert">
              {linkError}
            </p>
          )}
        </PopoverContent>
      </Popover>
      <Dialog
        open={alt !== null}
        onOpenChange={(open) => {
          if (!open) {
            setAlt(null);
            editor.commands.focus();
          }
        }}
      >
        <DialogContent className="post-editor-link-dialog" finalFocus={() => editor.view.dom}>
          <DialogTitle>图片替代文字</DialogTitle>
          <DialogDescription>描述图片内容，供辅助技术和图片无法加载时使用。</DialogDescription>
          <label className="post-editor-field" htmlFor="post-image-edit-alt">
            替代文字
            <Input
              id="post-image-edit-alt"
              value={alt?.value ?? ""}
              maxLength={2000}
              onChange={(event) =>
                setAlt((current) => (current ? { ...current, value: event.target.value } : null))
              }
            />
          </label>
          <div className="admin-form-actions">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setAlt(null);
                editor.commands.focus();
              }}
            >
              取消
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={disabled}
              onClick={() => {
                if (
                  !alt ||
                  !editor.isEditable ||
                  editor.state.doc.nodeAt(alt.position)?.type.name !== "image"
                )
                  return;
                editor
                  .chain()
                  .focus()
                  .setNodeSelection(alt.position)
                  .updateAttributes("image", { alt: alt.value.trim() })
                  .run();
                setAlt(null);
              }}
            >
              应用
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={size !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSize(null);
            editor.commands.focus();
          }
        }}
      >
        <DialogContent className="post-editor-link-dialog" finalFocus={() => editor.view.dom}>
          <DialogTitle>图片尺寸</DialogTitle>
          <DialogDescription>按原图比例调整，宽度和高度均不超过 10,000px。</DialogDescription>
          <label className="post-editor-field" htmlFor="post-image-width">
            宽度（px）
            <Input
              id="post-image-width"
              type="number"
              min={1}
              max={10000}
              step={1}
              value={size?.width ?? ""}
              aria-invalid={Boolean(sizeError)}
              aria-describedby={sizeError ? "post-image-size-error" : undefined}
              onChange={(event) =>
                setSize((current) => (current ? { ...current, width: event.target.value } : null))
              }
            />
          </label>
          {sizeError && (
            <p className="admin-post-error" id="post-image-size-error" role="alert">
              {sizeError}
            </p>
          )}
          <div className="admin-form-actions">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSize(null);
                editor.commands.focus();
              }}
            >
              取消
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={disabled}
              onClick={() => {
                if (!size || !editor.isEditable) return;
                const width = Number(size.width),
                  height = Math.round(width / size.ratio);
                if (
                  !Number.isInteger(width) ||
                  width < 1 ||
                  width > 10000 ||
                  height < 1 ||
                  height > 10000
                ) {
                  setSizeError("请输入使图片宽高均在 1～10,000px 范围内的整数宽度。");
                  return;
                }
                if (editor.state.doc.nodeAt(size.position)?.type.name !== "image") {
                  setSizeError("图片已变化，请关闭后重新选择。");
                  return;
                }
                editor
                  .chain()
                  .focus()
                  .setNodeSelection(size.position)
                  .updateAttributes("image", { width, height })
                  .run();
                setSize(null);
              }}
            >
              应用
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
