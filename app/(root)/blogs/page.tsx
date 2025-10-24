import { getPublishedBlogs } from "./actions";
import { BlogList } from "./components/blog-list";

export const revalidate = 60;

export default async function Page() {
  const { blogs } = await getPublishedBlogs();

  return (
    <div className="mx-auto flex min-h-screen max-w-wrapper flex-col px-6 pt-8 pb-24">
      <h2
        className={`
          pb-8 text-3xl font-bold
          md:text-4xl
        `}
      >
        博客
      </h2>

      <BlogList blogs={blogs} />
    </div>
  );
}
