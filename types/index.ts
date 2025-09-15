export type SortOrder = "asc" | "desc";

export interface OptionItem<T> {
  value: T;
  label: string;
}

export interface BaseResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export {
  type Snippet as DbSnippet,
  type Tag as DbTag,
  type User as DbUser,
  type Blog as DbBlog,
  type Note as DbNote,
  TagTypeEnum,
} from "@prisma/client";
