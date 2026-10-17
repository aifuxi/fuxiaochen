import { mergeAttributes, Node } from "@tiptap/core";

import { isContentColor, type ContentColor } from "./content-palette";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      toggleCallout: (tone?: ContentColor) => ReturnType;
    };
  }
}

export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,
  addAttributes() {
    return {
      tone: {
        default: "blue",
        parseHTML: (element) => {
          const tone = element.getAttribute("data-callout");
          return isContentColor(tone) ? tone : "blue";
        },
        renderHTML: ({ tone }) => ({ "data-callout": isContentColor(tone) ? tone : "blue" }),
      },
    };
  },
  parseHTML() {
    return [{ tag: "aside[data-callout]", contentElement: ".article-callout-content" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "aside",
      mergeAttributes(HTMLAttributes, { class: "article-callout" }),
      [
        "span",
        { class: "article-callout-icon", contentEditable: false, "aria-hidden": "true" },
        "📚",
      ],
      ["div", { class: "article-callout-content" }, 0],
    ];
  },
  addCommands() {
    return {
      toggleCallout:
        (tone = "blue") =>
        ({ commands }) =>
          commands.toggleWrap(this.name, { tone }),
    };
  },
});
