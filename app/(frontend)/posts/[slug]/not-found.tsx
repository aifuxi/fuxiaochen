import Link from "next/link";
export default function MissingPost() {
  return (
    <main data-page-motion id="main-content" className="site-main">
      <h1 className="ds-heading">文章不存在</h1>
      <p className="site-notice">这篇文章可能尚未发布或已被删除。</p>
      <Link className="site-back" href="/posts">
        返回文章列表
      </Link>
    </main>
  );
}
