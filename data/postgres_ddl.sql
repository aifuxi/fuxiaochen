-- PostgreSQL DDL derived from:
--   - data/blog_response.json
--   - data/category_response.json
--   - data/changelog_response.json
--   - data/tag_response.json
-- Notes:
--   - API wrapper fields (`code`, `message`, `timestamp`) are intentionally omitted.
--   - Denormalized nested fields (`category`, `blogs`, `tags`, `blogCount`) are intentionally omitted.
--   - `changelog.date` should be normalized to `release_date`, with source value `0` stored as `NULL`.

create table categories (
  id text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  name text not null,
  slug text not null,
  description text not null,
  constraint categories_pkey primary key (id),
  constraint categories_slug_key unique (slug)
);

create table tags (
  id text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  name text not null,
  slug text not null,
  description text not null,
  constraint tags_pkey primary key (id),
  constraint tags_slug_key unique (slug)
);

create table blogs (
  id text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  title text not null,
  slug text not null,
  description text not null,
  cover text not null default '',
  content text not null,
  published boolean not null default false,
  published_at timestamptz null,
  featured boolean not null default false,
  category_id text not null,
  constraint blogs_pkey primary key (id),
  constraint blogs_slug_key unique (slug),
  constraint blogs_category_id_fkey
    foreign key (category_id) references categories (id)
);

create table blog_tags (
  blog_id text not null,
  tag_id text not null,
  constraint blog_tags_pkey primary key (blog_id, tag_id),
  constraint blog_tags_blog_id_fkey
    foreign key (blog_id) references blogs (id) on delete cascade,
  constraint blog_tags_tag_id_fkey
    foreign key (tag_id) references tags (id) on delete cascade
);

create table changelogs (
  id text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  version text not null,
  content text not null,
  release_date date null,
  constraint changelogs_pkey primary key (id),
  constraint changelogs_version_key unique (version)
);

create index blogs_category_id_idx on blogs (category_id);
create index blogs_published_published_at_idx on blogs (published, published_at desc);
create index blog_tags_tag_id_idx on blog_tags (tag_id);
create index changelogs_release_date_idx on changelogs (release_date desc);
