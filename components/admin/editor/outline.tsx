"use client";

import type { Node } from "@tiptap/pm/model";

import { Extension, type Editor } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { useEffect, useState } from "react";

import { headingEntries } from "@/lib/posts/outline";

function headingDecorations(document: Node) {
  return DecorationSet.create(
    document,
    headingEntries(document).map((entry) => {
      const node = document.nodeAt(entry.position)!;
      return Decoration.node(entry.position, entry.position + node.nodeSize, { id: entry.id });
    }),
  );
}

// 锚点属于视图装饰，不给正文添加 ID；移动、撤销或同名标题都能重新定位。
export const OutlineAnchors = Extension.create({
  name: "articleOutlineAnchors",
  addProseMirrorPlugins() {
    return [
      new Plugin<DecorationSet>({
        state: {
          init: (_, state) => headingDecorations(state.doc),
          apply: (tr, previous) => (tr.docChanged ? headingDecorations(tr.doc) : previous),
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});

export function EditorOutline({
  editor,
  onNavigate,
}: {
  editor: Editor | null;
  onNavigate?: (id: string) => void;
}) {
  const [entries, setEntries] = useState(() => (editor ? headingEntries(editor.state.doc) : []));
  const [active, setActive] = useState("");
  useEffect(() => {
    if (!editor) return undefined;
    const update = () => setEntries(headingEntries(editor.state.doc));
    update();
    editor.on("update", update);
    return () => {
      editor.off("update", update);
    };
  }, [editor]);
  useEffect(() => {
    let frame = 0;
    const track = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        let id = entries[0]?.id ?? "";
        for (const entry of entries) {
          const element = document.getElementById(entry.id);
          if (element && element.getBoundingClientRect().top <= 140) id = entry.id;
        }
        setActive(id);
      });
    };
    track();
    document.addEventListener("scroll", track, { passive: true, capture: true });
    return () => {
      document.removeEventListener("scroll", track, true);
      cancelAnimationFrame(frame);
    };
  }, [entries]);
  return (
    <nav className="post-document-outline" aria-label="文档目录">
      <p>文档目录</p>
      {entries.length ? (
        <ol>
          {entries.map((entry) => (
            <li key={entry.id} style={{ paddingInlineStart: (entry.level - 1) * 12 }}>
              <a
                href={`#${entry.id}`}
                aria-current={active === entry.id ? "location" : undefined}
                title={entry.title}
                onClick={(event) => {
                  event.preventDefault();
                  setActive(entry.id);
                  if (onNavigate) onNavigate(entry.id);
                  else document.getElementById(entry.id)?.scrollIntoView({ block: "start" });
                }}
              >
                {entry.title}
              </a>
            </li>
          ))}
        </ol>
      ) : (
        <span>添加标题后，目录会显示在这里</span>
      )}
    </nav>
  );
}
