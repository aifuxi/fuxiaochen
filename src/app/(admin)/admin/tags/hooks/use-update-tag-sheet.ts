import { parseAsBoolean, parseAsInteger, useQueryState } from "nuqs";

export const useUpdateTagSheet = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "update-tag",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true }),
  );
  const [tagId, setTagId] = useQueryState(
    "tag-id",
    parseAsInteger.withOptions({ clearOnDefault: true }),
  );

  const openSheet = (value: number) => {
    void setIsOpen(true);
    void setTagId(value);
  };
  const closeSheet = () => {
    void setIsOpen(false);
    void setTagId(null);
  };

  return {
    tagId,
    setTagId,
    isOpen,
    openSheet,
    closeSheet,
    setIsOpen,
  };
};
