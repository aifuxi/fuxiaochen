import type { Table } from "@douyinfe/semi-ui-19";
import type { FormApi } from "@douyinfe/semi-ui-19/lib/es/form";
import type { RuleItem } from "@douyinfe/semi-ui-19/lib/es/form";
import type { ColumnProps } from "@douyinfe/semi-ui-19/lib/es/table";
import type { FileItem } from "@douyinfe/semi-ui-19/lib/es/upload";
import type { BlogCreateReq } from "fuxiaochen-types";

export type SemiTableOnChange = React.ComponentProps<typeof Table>["onChange"];

export type SemiTableColumnProps<T extends object> = ColumnProps<T>;

export type SemiFormApi<T extends object> = FormApi<T>;

export type SemiFormRuleItem = RuleItem;

export interface FormBlogCreateReq extends Omit<BlogCreateReq, "cover"> {
  cover?: FileItem[];
}
