"use client";

// 仅由隔离浏览器夹具复制到临时项目，生产页面不会引用这些事件控件。
import { useEffect, useState } from "react";

export default function EditorTransferControls() {
  const [bytes, setBytes] = useState<Blob | null>(null);
  const [message, setMessage] = useState("加载测试图片");
  useEffect(() => {
    void fetch("/editor-upload-test.jpg")
      .then((response) => response.blob())
      .then((blob) => {
        setBytes(blob);
        setMessage("图片已就绪；合成事件不能代替系统剪贴板或 Finder 拖动");
      });
    const observeDrop = (event: DragEvent) => {
      setMessage(
        JSON.stringify({
          types: event.dataTransfer?.types,
          files: event.dataTransfer?.files.length,
          items: Array.from(event.dataTransfer?.items ?? [], (item) => ({
            kind: item.kind,
            type: item.type,
          })),
        }),
      );
    };
    document.addEventListener("drop", observeDrop, true);
    return () => document.removeEventListener("drop", observeDrop, true);
  }, []);
  const fill = (data: DataTransfer, count: number) => {
    if (!bytes) return;
    for (let index = 0; index < count; index++)
      data.items.add(new File([bytes], `测试图片-${index + 1}.jpg`, { type: "image/jpeg" }));
  };
  const paste = (mixed: boolean, count: number) => {
    const editor = document.querySelector<HTMLElement>("#admin-post-body");
    if (!editor) return;
    const data = new DataTransfer();
    fill(data, count);
    if (mixed) {
      data.setData("text/plain", "复制前文复制后文");
      data.setData(
        "text/html",
        '<p><strong>复制前文</strong><img src="file:///测试图片.jpg">复制后文</p>',
      );
    }
    editor.dispatchEvent(
      new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }),
    );
    setMessage(`已发送合成${mixed ? "图文" : count + "张图片"}粘贴`);
  };
  const drop = () => {
    const editor = document.querySelector<HTMLElement>("#admin-post-body");
    if (!editor) return;
    const data = new DataTransfer();
    fill(data, 1);
    const rect = editor.querySelector("p")!.getBoundingClientRect();
    editor.dispatchEvent(
      new DragEvent("drop", {
        dataTransfer: data,
        clientX: rect.left + 60,
        clientY: rect.top + 12,
        bubbles: true,
        cancelable: true,
      }),
    );
  };
  return (
    <aside
      aria-label="隔离图片传输测试"
      style={{
        position: "fixed",
        right: 12,
        bottom: 12,
        zIndex: 200,
        background: "var(--color-bg)",
        border: "1px solid",
        padding: 8,
        maxWidth: 320,
      }}
    >
      <div>
        <button
          disabled={!bytes}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => paste(true, 1)}
        >
          合成图文粘贴
        </button>
        <button
          disabled={!bytes}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => paste(false, 2)}
        >
          合成双图粘贴
        </button>
        <button disabled={!bytes} onMouseDown={(event) => event.preventDefault()} onClick={drop}>
          合成文件拖入
        </button>
      </div>
      <div
        draggable={Boolean(bytes)}
        onDragStart={(event) => {
          fill(event.dataTransfer, 1);
          event.dataTransfer.effectAllowed = "copy";
          setMessage("浏览器文件拖动中");
        }}
        style={{ cursor: "grab", padding: 12 }}
      >
        拖动测试图片到正文
      </div>
      <output>{message}</output>
    </aside>
  );
}
