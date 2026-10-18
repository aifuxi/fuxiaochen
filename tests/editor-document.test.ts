import { getSchema, type JSONContent } from "@tiptap/core";
import { history, undo, redo } from "@tiptap/pm/history";
import { Node } from "@tiptap/pm/model";
import { EditorState, TextSelection } from "@tiptap/pm/state";
import { CellSelection, TableMap } from "@tiptap/pm/tables";
import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { blockTransaction } from "../components/admin/editor/editor-commands";
import { insertTableAxis, selectTableAxis } from "../components/admin/editor/table-actions";
import { ArticleContent } from "../components/frontend/article-content";
import { contentExtensions } from "../lib/posts/content-extensions";
import {
  CONTENT_BACKGROUNDS,
  CONTENT_COLORS,
  highlightColor,
  textColor,
} from "../lib/posts/content-palette";
import {
  CONTENT_TEXT_LIMIT,
  documentText,
  draftContentSchema,
  postContentSchema,
  readDocument,
  readDocumentNode,
  serializeDocument,
} from "../lib/posts/document";
import { croppedImageStyle, boundedImageSize } from "../lib/posts/image-layout";
import { markdownDocument } from "../lib/posts/markdown-document";
import { headingEntries } from "../lib/posts/outline";
import { tableColumns } from "../lib/posts/table-layout";
import { applyTextAlignment } from "../lib/posts/text-alignment";
import { legacyEditorDocument, richEditorDocument } from "./fixtures/editor-document";

const schema = getSchema(contentExtensions());
const roundtrip = (document: JSONContent) =>
  readDocument(postContentSchema.parse(serializeDocument(document)));

void test("前台目录锚点与六级同名标题一一对应，渲染不改写正文", () => {
  const content = serializeDocument({
    type: "doc",
    content: [
      ...Array.from({ length: 6 }, (_, index) => ({
        type: "heading",
        attrs: { level: index + 1, textAlign: "right" },
        content: [{ type: "text", text: "同名标题" }],
      })),
      { type: "blockquote", content: [{ type: "heading", attrs: { level: 3 } }] },
    ],
  });
  const document = readDocumentNode(content);
  const entries = headingEntries(document);
  const before = document.toJSON();
  const html = renderToStaticMarkup(ArticleContent({ content: document }));
  const ids = Array.from(html.matchAll(/<h[1-6] id="([^"]+)"/g), (match) => match[1]);
  assert.deepEqual(
    ids,
    entries.map((entry) => entry.id),
  );
  assert.equal(new Set(ids).size, 7);
  assert.equal(entries.at(-1)?.title, "未命名标题");
  assert.match(html, /tabindex="-1" style="text-align:right"/);
  assert.deepEqual(document.toJSON(), before);
  assert.equal(renderToStaticMarkup(ArticleContent({ content })), html);
});

void test("没有正文标题时目录为空，普通段落不生成虚假锚点", () => {
  const content = serializeDocument({
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text: "只有正文" }] }],
  });
  assert.deepEqual(headingEntries(readDocumentNode(content)), []);
  const html = renderToStaticMarkup(ArticleContent({ content }));
  assert.match(html, /<p>只有正文<\/p>/);
  assert.doesNotMatch(html, /post-heading-|tabindex/);
});

void test("裁剪、图注及两档背景色保存后在前台保持一致", () => {
  const document: JSONContent = {
    type: "doc",
    content: [
      {
        type: "paragraph",
        attrs: { textAlign: "center" },
        content: [
          {
            type: "image",
            attrs: {
              src: "https://images.example/crop.jpg",
              alt: "原始替代文字",
              width: 300,
              height: 200,
              caption: "裁剪后的图注",
              crop: { left: 0.25, top: 0.1, width: 0.5, height: 0.8 },
            },
          },
        ],
      },
      {
        type: "table",
        content: [
          {
            type: "tableRow",
            content: CONTENT_BACKGROUNDS.map((item) => ({
              type: "tableCell",
              attrs: { backgroundColor: item.value },
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: item.name,
                      marks: [{ type: "highlight", attrs: { color: item.value } }],
                    },
                  ],
                },
              ],
            })),
          },
        ],
      },
    ],
  };
  const restored = roundtrip(document);
  assert.deepEqual(roundtrip(restored), restored);
  assert.match(documentText(restored), /原始替代文字\n裁剪后的图注/);
  const html = renderToStaticMarkup(ArticleContent({ content: serializeDocument(restored) }));
  assert.match(html, /data-article-image=""/);
  assert.match(html, /aspect-ratio:300 \/ 200/);
  assert.match(html, /width:200%/);
  assert.match(html, /left:-50%/);
  assert.match(html, /article-image-caption">裁剪后的图注/);
  assert.match(html, /background-color:var\(--article-blue-bg-strong\)/);
  assert.deepEqual(croppedImageStyle({ left: 0.25, top: 0.1, width: 0.5, height: 0.8 }), {
    width: "200%",
    height: "125%",
    left: "-50%",
    top: "-12.5%",
  });
});

void test("大图恢复与扩展裁剪时等比限制尺寸，缺少可见宽高的裁剪不能保存", () => {
  assert.deepEqual(boundedImageSize(20000, 12000), { width: 10000, height: 6000 });
  assert.throws(() =>
    roundtrip({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "image",
              attrs: { src: "/image.jpg", crop: { left: 0, top: 0, width: 0.5, height: 1 } },
            },
          ],
        },
      ],
    }),
  );
});

void test("拒绝越界裁剪、超长图注与任意单元格背景", () => {
  for (const crop of [
    { left: -0.1, top: 0, width: 1, height: 1 },
    { left: 0.5, top: 0, width: 0.6, height: 1 },
    { left: 0, top: 0, width: 0, height: 1 },
    { left: 0, top: 0, width: 1, height: 1, unknown: true },
  ]) {
    assert.throws(() =>
      roundtrip({
        type: "doc",
        content: [
          { type: "paragraph", content: [{ type: "image", attrs: { src: "/image.jpg", crop } }] },
        ],
      }),
    );
  }
  assert.throws(() =>
    roundtrip({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "image", attrs: { src: "/image.jpg", caption: "字".repeat(2001) } }],
        },
      ],
    }),
  );
  assert.throws(() =>
    roundtrip({
      type: "doc",
      content: [
        {
          type: "table",
          content: [
            {
              type: "tableRow",
              content: [
                {
                  type: "tableCell",
                  attrs: { backgroundColor: "url(https://evil.example)" },
                  content: [{ type: "paragraph" }],
                },
              ],
            },
          ],
        },
      ],
    }),
  );
});

void test("行列控制条跨合并边界插入可撤销，选区包含完整逻辑行列", () => {
  const doc = Node.fromJSON(schema, roundtrip(richEditorDocument));
  let position = 0;
  doc.forEach((node, pos) => {
    if (node.type.name === "table") position = pos;
  });
  const table = doc.nodeAt(position)!;
  const map = TableMap.get(table);
  let state = EditorState.create({
    schema,
    doc,
    selection: CellSelection.create(doc, position + 1 + map.map[0]),
    plugins: [history()],
  });
  // 只模拟 Editor 的事务边界；操作本身使用真实 ProseMirror 表格算法。
  const editor = {
    get state() {
      return state;
    },
    isEditable: true,
    view: {
      dispatch: (tr: EditorState["tr"]) => {
        state = state.apply(tr);
      },
    },
    commands: { focus: () => true },
  };
  assert.equal(selectTableAxis(editor, "column", 1), true);
  assert.ok(state.selection instanceof CellSelection && state.selection.isColSelection());
  assert.equal(insertTableAxis(editor, "column", 1), true);
  assert.equal(TableMap.get(state.doc.nodeAt(position)!).width, map.width + 1);
  assert.equal(state.doc.nodeAt(position)!.firstChild!.firstChild!.attrs.colspan, 3);
  assert.doesNotThrow(() => roundtrip(state.doc.toJSON()));
  assert.ok(
    undo(state, (tr) => {
      state = state.apply(tr);
    }),
  );
  assert.deepEqual(state.doc.toJSON(), doc.toJSON());
  assert.equal(selectTableAxis(editor, "row", 1), true);
  assert.ok(state.selection instanceof CellSelection && state.selection.isRowSelection());
  assert.equal(insertTableAxis(editor, "row", 1), true);
  assert.equal(TableMap.get(state.doc.nodeAt(position)!).height, map.height + 1);
  assert.doesNotThrow(() => roundtrip(state.doc.toJSON()));
  assert.ok(
    undo(state, (tr) => {
      state = state.apply(tr);
    }),
  );
  assert.deepEqual(state.doc.toJSON(), doc.toJSON());
  assert.equal(insertTableAxis(editor, "column", 101), false);
});

void test("旧版正文无迁移读取，新增格式往返保持稳定", () => {
  const old = roundtrip(legacyEditorDocument);
  assert.equal(documentText(old), "旧文章标题\n原有正文\n旧图片");
  assert.equal(JSON.parse(serializeDocument(old)).version, 1);
  assert.deepEqual(roundtrip(old), old);
  const rich = roundtrip(richEditorDocument);
  assert.deepEqual(roundtrip(rich), rich);
  assert.equal(rich.content?.[1].content?.[0].marks?.length, 7);
  assert.match(documentText(rich), /高亮块第一段\n高亮块第二段/);
  assert.ok(!serializeDocument(rich).includes("post-heading-"), "目录锚点不能进入保存内容");
});

void test("全部预设色与默认高亮能通过共同 schema，任意 CSS 被拒绝", () => {
  for (const color of CONTENT_COLORS) {
    assert.doesNotThrow(() =>
      roundtrip({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: color.name,
                marks: [
                  { type: "textStyle", attrs: { color: textColor(color.key) } },
                  { type: "highlight", attrs: { color: highlightColor(color.key) } },
                ],
              },
            ],
          },
        ],
      }),
    );
  }
  assert.doesNotThrow(() =>
    roundtrip({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "默认高亮", marks: [{ type: "highlight" }] }],
        },
      ],
    }),
  );
  for (const value of [
    "red",
    "#ff0000",
    "url(https://example.com/)",
    "var(--untrusted)",
    "var(--article-red);display:none",
  ]) {
    assert.throws(() =>
      roundtrip({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "拒绝",
                marks: [{ type: "textStyle", attrs: { color: value } }],
              },
            ],
          },
        ],
      }),
    );
  }
});

void test("未知节点、属性、重复标记和不合法尺寸不能静默丢弃", () => {
  const invalid: JSONContent[] = [
    { type: "unknown", content: [] },
    {
      type: "paragraph",
      attrs: { textAlign: "justify" },
      content: [{ type: "text", text: "非法对齐" }],
    },
    { type: "callout", attrs: { tone: "unknown" }, content: [{ type: "paragraph" }] },
    {
      type: "paragraph",
      content: [{ type: "text", text: "重复", marks: [{ type: "bold" }, { type: "bold" }] }],
    },
    { type: "paragraph", content: [{ type: "image", attrs: { src: "javascript:alert(1)" } }] },
    {
      type: "paragraph",
      content: [{ type: "image", attrs: { src: "https://images.example/a.png", width: 0 } }],
    },
    {
      type: "paragraph",
      content: [{ type: "image", attrs: { src: "https://images.example/a.png", height: 12.5 } }],
    },
  ];
  for (const node of invalid)
    assert.throws(() => readDocument(serializeDocument({ type: "doc", content: [node] })));
  assert.throws(() =>
    readDocument(
      JSON.stringify({ format: "fuxiaochen-tiptap", version: 2, document: legacyEditorDocument }),
    ),
  );
});

void test("表格合并列宽及未知宽度标记保留，错误跨度和列宽不匹配被拒绝", () => {
  const rich = roundtrip(richEditorDocument);
  const table = rich.content?.find((node) => node.type === "table");
  assert.ok(table);
  assert.deepEqual(tableColumns(Node.fromJSON(schema, table)), [180, 0]);
  const invalid = structuredClone(table);
  invalid.content![0].content![0].attrs!.colwidth = [180];
  assert.throws(() => roundtrip({ type: "doc", content: [invalid] }));
  const broken = structuredClone(table);
  broken.content![0].content![0].attrs!.colspan = 3;
  broken.content![0].content![0].attrs!.colwidth = [100, 100, 100];
  assert.throws(() => roundtrip({ type: "doc", content: [broken] }));
});

void test("前台输出新增格式、对齐、callout、合并表格与图片尺寸", () => {
  const html = renderToStaticMarkup(
    ArticleContent({ content: postContentSchema.parse(serializeDocument(richEditorDocument)) }),
  );
  assert.match(html, /text-align:center/);
  assert.match(html, /text-align:right/);
  assert.match(html, /color:var\(--article-red\)/);
  assert.match(html, /background-color:var\(--article-yellow-bg\)/);
  assert.match(html, /data-callout="orange"/);
  assert.match(html, /article-callout-content/);
  assert.match(html, /<colgroup><col style="width:180px"/);
  assert.match(html, /colSpan="2"|colspan="2"/);
  assert.match(html, /width="240"/);
  assert.match(html, /height="180"/);
  assert.match(html, /缩放图片/);
  assert.match(html, /typescript|TypeScript/);
});

void test("块移动、创建副本与删除可撤销，不丢失嵌套内容", () => {
  const original = Node.fromJSON(schema, roundtrip(richEditorDocument));
  let state = EditorState.create({ schema, doc: original, plugins: [history()] });
  assert.equal(blockTransaction(state, 0, "up"), null);
  const moved = blockTransaction(state, 0, "down");
  assert.ok(moved);
  state = state.apply(moved);
  assert.equal(state.doc.child(1).type.name, "heading");
  assert.ok(
    undo(state, (tr) => {
      state = state.apply(tr);
    }),
  );
  assert.deepEqual(state.doc.toJSON(), original.toJSON());
  assert.ok(
    redo(state, (tr) => {
      state = state.apply(tr);
    }),
  );
  assert.equal(state.doc.child(1).type.name, "heading");
  state = EditorState.create({ schema, doc: original, plugins: [history()] });
  const duplicate = blockTransaction(state, 0, "duplicate");
  assert.ok(duplicate);
  state = state.apply(duplicate);
  assert.ok(state.doc.child(0).eq(state.doc.child(1)));
  assert.ok(
    undo(state, (tr) => {
      state = state.apply(tr);
    }),
  );
  assert.deepEqual(state.doc.toJSON(), original.toJSON());
  const removed = blockTransaction(
    state,
    original.child(0).nodeSize + original.child(1).nodeSize,
    "delete",
  );
  assert.ok(removed);
  state = state.apply(removed);
  assert.ok(!state.doc.textContent.includes("高亮块第一段"));
  assert.ok(
    undo(state, (tr) => {
      state = state.apply(tr);
    }),
  );
  assert.deepEqual(state.doc.toJSON(), original.toJSON());
});

void test("选区只接触上一标题闭合边界时，对齐仅改变实际选中的段落", () => {
  const document = Node.fromJSON(
    schema,
    roundtrip({
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "前一标题" }] },
        { type: "paragraph", content: [{ type: "text", text: "选中文字" }] },
        { type: "paragraph", content: [{ type: "text", text: "后一段落" }] },
      ],
    }),
  );
  const boundary = document.child(0).nodeSize;
  const state = EditorState.create({ schema, doc: document });
  const tr = state.tr.setSelection(TextSelection.create(document, boundary - 1, boundary + 4));
  assert.ok(applyTextAlignment(tr, "center"));
  assert.equal(tr.doc.child(0).attrs.textAlign, null);
  assert.equal(tr.doc.child(1).attrs.textAlign, "center");
  assert.equal(tr.doc.child(2).attrs.textAlign, null);
  const preview = state.tr.setSelection(TextSelection.create(document, boundary + 2));
  assert.ok(applyTextAlignment(preview, "right", false));
  assert.deepEqual(preview.doc.toJSON(), document.toJSON(), "能力查询不能修改文档");
});

void test("目录重复标题按位置区分，文档限制和 Markdown 导入保持有效", () => {
  const document = Node.fromJSON(
    schema,
    roundtrip({
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "相同" }] },
        { type: "heading", attrs: { level: 6 }, content: [{ type: "text", text: "相同" }] },
      ],
    }),
  );
  const entries = headingEntries(document);
  assert.equal(entries.length, 2);
  assert.notEqual(entries[0].id, entries[1].id);
  assert.equal(entries[1].level, 6);
  assert.doesNotThrow(() =>
    postContentSchema.parse(
      serializeDocument(markdownDocument("# 导入\n\n- [x] 任务\n\n<script>原样文字</script>")),
    ),
  );
  assert.ok(
    draftContentSchema.safeParse(
      serializeDocument({ type: "doc", content: [{ type: "paragraph" }] }),
    ).success,
  );
  assert.ok(
    !postContentSchema.safeParse(
      serializeDocument({ type: "doc", content: [{ type: "paragraph" }] }),
    ).success,
  );
  assert.throws(() =>
    postContentSchema.parse(
      serializeDocument({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "字".repeat(CONTENT_TEXT_LIMIT + 1) }],
          },
        ],
      }),
    ),
  );
});
