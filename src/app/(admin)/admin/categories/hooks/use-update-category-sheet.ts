import { parseAsBoolean, parseAsInteger, useQueryState } from "nuqs";

export const useUpdateCategorySheet = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "update-category",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true }),
  );
  const [tagId, setCategoryId] = useQueryState(
    "category-id",
    parseAsInteger.withOptions({ clearOnDefault: true }),
  );

  const openSheet = (value: number) => {
    void setIsOpen(true);
    void setCategoryId(value);
  };
  const closeSheet = () => {
    void setIsOpen(false);
    void setCategoryId(null);
  };

  return {
    tagId,
    setCategoryId,
    isOpen,
    openSheet,
    closeSheet,
    setIsOpen,
  };
};
