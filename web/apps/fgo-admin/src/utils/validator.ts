import type { SemiFormRuleItem } from "@/types/semi";

export const SLUG_REGEX = /^[a-z0-9-]+$/;

export const slugValidatorRule: SemiFormRuleItem = {
  pattern: SLUG_REGEX,
  message: "仅支持小写字母、数字和短横线(-)",
};
