import { getSchema, type JSONContent } from "@tiptap/core";
import { Node } from "@tiptap/pm/model";
import { TableMap } from "@tiptap/pm/tables";
import { z } from "zod";

import { contentExtensions } from "./content-extensions";
import { isContentColor, isHighlightColor, isTextColor } from "./content-palette";
import { safeContentUrl } from "./content-url";
import { imageCropSchema } from "./image-layout";

export const CONTENT_FORMAT = "fuxiaochen-tiptap";
export const CONTENT_TEXT_LIMIT = 100_000;
const schema = getSchema(contentExtensions());
const nullableString = z.string().max(2000).nullable().optional();
const textAlign = z.enum(["left", "center", "right"]).nullable().optional();
const nodeAttributes: Record<string, z.ZodType> = {
  paragraph: z.strictObject({ textAlign }),
  heading: z.strictObject({ level: z.number().int().min(1).max(6), textAlign }),
  callout: z.strictObject({ tone: z.string().refine(isContentColor).optional() }),
  orderedList: z.strictObject({
    start: z.number().int().min(1).max(1_000_000).optional(),
    type: z.enum(["1", "a", "A", "i", "I"]).nullable().optional(),
  }),
  codeBlock: z.strictObject({ language: z.string().max(100).nullable().optional() }),
  taskItem: z.strictObject({ checked: z.boolean() }),
  image: z
    .strictObject({
      src: z
        .string()
        .max(2000)
        .refine((value) => safeContentUrl(value, true)),
      alt: nullableString,
      title: nullableString,
      width: z.number().int().min(1).max(10_000).nullable().optional(),
      height: z.number().int().min(1).max(10_000).nullable().optional(),
      caption: z.string().max(2000).nullable().optional(),
      crop: imageCropSchema.nullable().optional(),
    })
    .refine(
      (image) => !image.crop || Boolean(image.width && image.height),
      "裁剪图片必须包含可见宽高。",
    ),
};
const cellAttributes = z
  .strictObject({
    colspan: z.number().int().min(1).max(100).optional(),
    rowspan: z.number().int().min(1).max(100).optional(),
    colwidth: z.array(z.number().int().min(0).max(10_000)).max(100).nullable().optional(),
    align: z.enum(["left", "center", "right"]).nullable().optional(),
    backgroundColor: z.string().refine(isHighlightColor).nullable().optional(),
  })
  .superRefine((cell, ctx) => {
    if (cell.colwidth && cell.colwidth.length !== (cell.colspan ?? 1))
      ctx.addIssue({ code: "custom", message: "单元格列宽与合并列数不一致。" });
  });
nodeAttributes.tableCell = cellAttributes;
nodeAttributes.tableHeader = cellAttributes;
const linkAttributes = z.strictObject({
  href: z
    .string()
    .max(2000)
    .refine((value) => safeContentUrl(value)),
  target: z.enum(["_blank", "_self"]).nullable().optional(),
  rel: nullableString,
  class: z.null().optional(),
  title: nullableString,
});
const markSchema = z
  .strictObject({
    type: z.enum([
      "bold",
      "italic",
      "strike",
      "underline",
      "code",
      "link",
      "textStyle",
      "highlight",
    ]),
    attrs: z.record(z.string(), z.unknown()).optional(),
  })
  .superRefine((mark, ctx) => {
    const attributes =
      mark.type === "link"
        ? linkAttributes
        : mark.type === "textStyle"
          ? z.strictObject({ color: z.string().refine(isTextColor).nullable().optional() })
          : mark.type === "highlight"
            ? z.strictObject({ color: z.string().refine(isHighlightColor).nullable().optional() })
            : z.strictObject({});
    const result = attributes.safeParse(mark.attrs ?? {});
    if (!result.success) ctx.addIssue({ code: "custom", message: "文字格式属性无效。" });
  });
const nodeSchema: z.ZodType<JSONContent> = z.lazy(() =>
  z
    .strictObject({
      type: z.enum([
        "doc",
        "paragraph",
        "text",
        "heading",
        "bulletList",
        "orderedList",
        "listItem",
        "taskList",
        "taskItem",
        "blockquote",
        "callout",
        "codeBlock",
        "horizontalRule",
        "hardBreak",
        "table",
        "tableRow",
        "tableCell",
        "tableHeader",
        "image",
      ]),
      text: z.string().max(CONTENT_TEXT_LIMIT).optional(),
      attrs: z.record(z.string(), z.unknown()).optional(),
      marks: z.array(markSchema).max(8).optional(),
      content: z.array(nodeSchema).max(10_000).optional(),
    })
    .superRefine((node, ctx) => {
      if (!(nodeAttributes[node.type] ?? z.strictObject({})).safeParse(node.attrs ?? {}).success)
        ctx.addIssue({ code: "custom", message: "内容块属性无效。" });
      if (node.type !== "text" && node.text !== undefined)
        ctx.addIssue({ code: "custom", message: "非文字节点不能包含 text。" });
      if (node.marks && new Set(node.marks.map((mark) => mark.type)).size !== node.marks.length)
        ctx.addIssue({ code: "custom", message: "文字格式不能重复。" });
    }),
);

// 先检查深度，再递归校验，避免恶意深层 JSON 使解析栈溢出。
function boundedDocument(value: unknown) {
  const pending: { value: unknown; depth: number }[] = [{ value, depth: 0 }];
  let count = 0;
  while (pending.length) {
    const item = pending.pop()!;
    if (++count > 20_000 || item.depth > 32) return false;
    if (item.value && typeof item.value === "object" && "content" in item.value) {
      const children = item.value.content;
      if (Array.isArray(children))
        for (const child of children) pending.push({ value: child, depth: item.depth + 1 });
    }
  }
  return true;
}

export function validateDocument(value: unknown): JSONContent {
  if (!boundedDocument(value)) throw new Error("正文结构过深或内容块过多。");
  const document = nodeSchema.parse(value);
  if (document.type !== "doc") throw new Error("正文必须是文档节点。");
  try {
    const node = Node.fromJSON(schema, document);
    node.check();
    node.descendants((child) => {
      if (child.type.name === "table") {
        const map = TableMap.get(child);
        if (map.width > 100 || map.problems?.length) throw new Error("表格结构无效。");
      }
    });
    const normalized: JSONContent = node.toJSON();
    return normalized;
  } catch {
    throw new Error("正文文档结构无效。");
  }
}

export function documentText(document: JSONContent): string {
  if (document.type === "text") return document.text ?? "";
  if (document.type === "image")
    return [document.attrs?.alt, document.attrs?.caption].filter(Boolean).join("\n");
  if (document.type === "hardBreak") return "\n";
  const separator = [
    "doc",
    "bulletList",
    "orderedList",
    "taskList",
    "blockquote",
    "callout",
    "listItem",
    "taskItem",
    "tableCell",
    "tableHeader",
    "table",
    "tableRow",
  ].includes(document.type ?? "")
    ? "\n"
    : "";
  return (document.content ?? []).map(documentText).join(separator);
}

export function serializeDocument(document: JSONContent) {
  return JSON.stringify({
    format: CONTENT_FORMAT,
    version: 1,
    document,
    text: documentText(document),
  });
}

export const EMPTY_POST_CONTENT = serializeDocument({
  type: "doc",
  content: [{ type: "paragraph" }],
});

export function readDocument(content: string): JSONContent {
  let value: unknown;
  try {
    value = JSON.parse(content);
  } catch {
    throw new Error("正文文档格式无效。");
  }
  const envelope = z
    .object({
      format: z.literal(CONTENT_FORMAT),
      version: z.literal(1),
      document: z.unknown(),
      text: z.string().optional(),
    })
    .parse(value);
  return validateDocument(envelope.document);
}

const contentSchema = (allowEmpty: boolean) =>
  z
    .string()
    .max(500_000, "正文文档过大。")
    .transform((value, ctx) => {
      try {
        const document = readDocument(value);
        const text = documentText(document);
        let hasImage = false;
        const visit = (node: JSONContent) => {
          if (node.type === "image") hasImage = true;
          node.content?.forEach(visit);
        };
        visit(document);
        if (!allowEmpty && !text.trim() && !hasImage) throw new Error("请输入正文内容。");
        if (text.length > CONTENT_TEXT_LIMIT) throw new Error("正文最多 100,000 个字符。");
        // 搜索文本由校验后的文档重新生成，不信任客户端提交的 text。
        const normalized = serializeDocument(document);
        if (
          normalized.length > 500_000 ||
          new TextEncoder().encode(JSON.stringify(normalized)).length > 950_000
        )
          throw new Error("正文文档过大。");
        return normalized;
      } catch (error) {
        ctx.addIssue({
          code: "custom",
          message:
            error instanceof z.ZodError
              ? "正文文档格式无效。"
              : error instanceof Error
                ? error.message
                : "正文文档格式无效。",
        });
        return z.NEVER;
      }
    });
export const postContentSchema = contentSchema(false);
export const draftContentSchema = contentSchema(true);
