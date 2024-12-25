"use client";

import React, { useState } from "react";

import { useMount } from "ahooks";

import { Button } from "@/components/ui/button";

import { BytemdEditor } from "@/components/bytemd";

import { mockMarkdown } from "./mock-markdown";

import { CreateBlogSheet } from "../_components/create-blog-sheet";
import { useCreateBlogSheet } from "../hooks/use-create-blog-sheet";

export default function Page() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState(mockMarkdown);
  const { openSheet, isOpen } = useCreateBlogSheet();

  useMount(() => {
    document.body.style.overflowY = "hidden";
  });

  return (
    <div className="flex flex-col">
      <div className="flex h-16 px-7">
        <input
          placeholder="输入文章标题"
          value={title}
          onChange={(v) => setTitle(v.target.value)}
          className="h-full flex-1 border-none !bg-transparent px-6 text-2xl font-bold text-secondary-foreground outline-none"
        />

        <div className="flex h-full flex-col justify-center px-6">
          <Button onClick={() => openSheet()}>发布</Button>
        </div>
      </div>
      {isOpen && <CreateBlogSheet title={title} body={body} />}
      <div className="bytemd-wrapper">
        <BytemdEditor setBody={setBody} body={body} />
      </div>
    </div>
  );
}
