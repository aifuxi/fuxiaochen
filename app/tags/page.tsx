import Link from 'next/link';

import { getTags } from '@/services';

const TagsPage = async () => {
  const data = await getTags({ pageSize: 10000 });
  return (
    <div className="flex flex-col space-y-8 min-h-[68vh]">
      <h1
        className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900
    sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 border-b py-8"
      >
        标签
      </h1>
      <ul className="flex flex-wrap">
        {data?.data?.map((tag) => (
          <li key={tag.id} className="flex space-x-2 ">
            <Link
              className="mr-4 mb-4 text-sm font-medium text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
              href={`/tags/${tag.friendlyUrl}`}
            >
              {tag.name}
              <span className="text-sm font-semibold text-gray-600">
                ({tag.articleCount || 0})
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TagsPage;
