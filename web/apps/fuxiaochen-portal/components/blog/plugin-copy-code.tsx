import type { BytemdPlugin } from "bytemd";

export default function copyCodePlugin(): BytemdPlugin {
  return {
    viewerEffect({ markdownBody }) {
      const pres = markdownBody.querySelectorAll("pre");

      pres.forEach((pre) => {
        if (pre.querySelector(".copy-code-btn")) return;

        const button = document.createElement("button");
        button.className = "copy-code-btn";
        button.ariaLabel = "复制代码 / Copy code";
        button.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="copy-icon"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="check-icon"><polyline points="20 6 9 17 4 12"></polyline></svg>
        `;

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        button.addEventListener("click", async () => {
          const code = pre.querySelector("code")?.innerText;
          if (code) {
            try {
              await navigator.clipboard.writeText(code);
              button.classList.add("copied");
              setTimeout(() => {
                button.classList.remove("copied");
              }, 2000);
            } catch (err) {
              console.error("Failed to copy code:", err);
            }
          }
        });

        pre.appendChild(button);
      });
    },
  };
}
