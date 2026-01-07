import { NICKNAME } from "@/constants";

export function BlogHero() {
  return (
    <section className="border-b border-border bg-card py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <div className="mb-6 inline-block rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-mono text-xs text-primary">
            一个 React + TypeScript + Go 爱好者
          </div>
          <h1 className="mb-6 text-3xl leading-tight font-bold text-balance md:text-5xl">
            你好，我是 <br />
            <span className="text-5xl leading-normal text-primary md:text-7xl">
              {NICKNAME}
            </span>
            <br />
            一名前端开发工程师。
          </h1>
          <p className="text-xl leading-relaxed text-muted-foreground">
            我在这个网站记录我的成长，努力 💪 成为一个更好的程序员。
          </p>
        </div>
      </div>
    </section>
  );
}
