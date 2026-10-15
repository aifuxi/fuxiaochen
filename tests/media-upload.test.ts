import assert from "node:assert/strict";
import { after, beforeEach, test } from "node:test";

import { uploadEditorImage } from "../components/admin/use-media";

// 替换浏览器的传输边界，保留实际上传函数；不会访问真实 OSS。
class TestXHR extends EventTarget {
  static instances: TestXHR[] = [];
  static sendAction: (xhr: TestXHR) => void = (xhr) => {
    xhr.status = 200;
    xhr.dispatchEvent(new Event("load"));
  };
  upload = new EventTarget();
  headers: Record<string, string> = {};
  status = 0;
  timeout = 0;
  withCredentials = true;
  method = "";
  url = "";
  body: File | null = null;
  constructor() {
    super();
    TestXHR.instances.push(this);
  }
  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }
  setRequestHeader(name: string, value: string) {
    this.headers[name] = value;
  }
  send(file: File) {
    this.body = file;
    queueMicrotask(() => TestXHR.sendAction(this));
  }
  abort() {
    this.dispatchEvent(new Event("abort"));
  }
}
const originalXHR = Object.getOwnPropertyDescriptor(globalThis, "XMLHttpRequest");
Object.defineProperty(globalThis, "XMLHttpRequest", { configurable: true, value: TestXHR });
after(() => {
  if (originalXHR) Object.defineProperty(globalThis, "XMLHttpRequest", originalXHR);
  else Reflect.deleteProperty(globalThis, "XMLHttpRequest");
});
beforeEach(() => {
  TestXHR.instances = [];
  TestXHR.sendAction = (xhr) => {
    xhr.status = 200;
    xhr.dispatchEvent(new Event("load"));
  };
});
const ticket = {
  url: "https://oss.test.example/media/test?signature=only-for-test",
  publicUrl: "https://media.test.example/media/test",
  headers: { "Content-Type": "image/png" },
  expiresAt: new Date(Date.now() + 300_000).toISOString(),
};

void test("原始文件只 PUT 到 OSS，签名请求不传内容，返回永久 URL 和上传进度", async (t) => {
  const requests: { path: string; init?: RequestInit }[] = [];
  t.mock.method(globalThis, "fetch", async (path: string, init?: RequestInit) => {
    requests.push({ path, init });
    return Response.json({ data: ticket });
  });
  const file = new File(["不需要解码的文件内容"], "test.png", { type: "image/png" });
  t.mock.method(file, "arrayBuffer", () => {
    throw new Error("不得读取文件计算摘要");
  });
  TestXHR.sendAction = (xhr) => {
    const event = Object.assign(new Event("progress"), {
      lengthComputable: true,
      loaded: 1,
      total: 2,
    });
    xhr.upload.dispatchEvent(event);
    xhr.status = 200;
    xhr.dispatchEvent(new Event("load"));
  };
  const progress: number[] = [];
  assert.equal(
    await uploadEditorImage(file, new AbortController().signal, (value) => progress.push(value)),
    ticket.publicUrl,
  );
  assert.equal(requests.length, 1, "只有签名请求，没有 complete、校验或删除请求");
  assert.equal(requests[0].path, "/api/admin/media/uploads");
  const requestBody = requests[0].init?.body;
  assert.equal(typeof requestBody, "string");
  if (typeof requestBody !== "string") throw new Error("签名请求必须使用 JSON 文本");
  assert.deepEqual(JSON.parse(requestBody), { contentType: "image/png" });
  const xhr = TestXHR.instances[0];
  assert.equal(xhr.method, "PUT");
  assert.equal(xhr.url, ticket.url);
  assert.equal(xhr.body, file);
  assert.equal(xhr.withCredentials, false);
  assert.deepEqual(xhr.headers, ticket.headers);
  assert.deepEqual(progress, [50]);
});

void test("OSS 上传失败不能返回成功链接，显式重试可成功", async (t) => {
  t.mock.method(globalThis, "fetch", async () => Response.json({ data: ticket }));
  const file = new File(["content"], "test.png", { type: "image/png" });
  TestXHR.sendAction = (xhr) => {
    xhr.status = 403;
    xhr.dispatchEvent(new Event("load"));
  };
  await assert.rejects(
    uploadEditorImage(file, new AbortController().signal, () => {}),
    /OSS 上传失败/,
  );
  TestXHR.sendAction = (xhr) => {
    xhr.status = 200;
    xhr.dispatchEvent(new Event("load"));
  };
  assert.equal(
    await uploadEditorImage(file, new AbortController().signal, () => {}),
    ticket.publicUrl,
  );
});

void test("签名后取消不会上传，上传中取消不会插入或请求删除", async (t) => {
  const controller = new AbortController();
  t.mock.method(globalThis, "fetch", async () => {
    controller.abort();
    return Response.json({ data: ticket });
  });
  const file = new File(["content"], "test.png");
  await assert.rejects(
    uploadEditorImage(file, controller.signal, () => {}),
    { name: "AbortError" },
  );
  assert.equal(TestXHR.instances.length, 0);
  t.mock.restoreAll();
  const requests: string[] = [];
  t.mock.method(globalThis, "fetch", async (path: string) => {
    requests.push(path);
    return Response.json({ data: ticket });
  });
  const running = new AbortController();
  TestXHR.sendAction = () => running.abort();
  await assert.rejects(
    uploadEditorImage(file, running.signal, () => {}),
    { name: "AbortError" },
  );
  assert.deepEqual(requests, ["/api/admin/media/uploads"]);
});

void test("签名接口报错时保留错误，不发送文件", async (t) => {
  t.mock.method(globalThis, "fetch", async () =>
    Response.json({ error: { code: "UNAUTHORIZED", message: "登录已失效" } }, { status: 401 }),
  );
  await assert.rejects(
    uploadEditorImage(new File(["content"], "test.png"), new AbortController().signal, () => {}),
    { code: "UNAUTHORIZED" },
  );
  assert.equal(TestXHR.instances.length, 0);
});
