import type { BytemdPlugin } from "bytemd";

export default function headingsPlugin(): BytemdPlugin {
  return {
    viewerEffect({ markdownBody }) {
      const headings = markdownBody.querySelectorAll("h1, h2, h3, h4, h5, h6");
      const usedIds = new Set<string>();

      headings.forEach((heading) => {
        let id = heading.id;

        if (!id) {
          const text = heading.textContent || "";
          id = text
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]/g, "");

          if (!id) {
            id = "heading";
          }
        }

        // Ensure uniqueness
        let uniqueId = id;
        let counter = 1;
        while (usedIds.has(uniqueId)) {
          uniqueId = `${id}-${counter}`;
          counter++;
        }

        usedIds.add(uniqueId);
        heading.id = uniqueId;
        heading.classList.add("scroll-mt-24"); // Add scroll margin for sticky header
      });
    },
  };
}
