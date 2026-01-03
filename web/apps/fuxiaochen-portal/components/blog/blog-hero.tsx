import { NICKNAME } from "@/constants";

export function BlogHero() {
  return (
    <section className="py-20 bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <div className="inline-block px-3 py-1 mb-6 text-xs font-mono bg-primary/10 text-primary rounded-full border border-primary/20">
            一个 React + TypeScript + Go 爱好者
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight text-balance">
            你好，我是 <br />
            <span className="text-primary text-5xl md:text-7xl leading-normal">
              {NICKNAME}
            </span>
            <br />
            一名前端开发工程师。
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            我在这个网站记录我的成长，努力 💪 成为一个更好的程序员。
          </p>
        </div>
      </div>
    </section>
  );
}
